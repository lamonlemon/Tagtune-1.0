# TagTune — MVP Product Requirements Document

## Overview

TagTune is a tag-based music playlist generator built on a personally curated YouTube Music database.

**Core value proposition:**
YouTube Music's autoplay mixes in unrelated songs, and personal playlists repeat. TagTune solves this by letting users start from a song they like, confirm or adjust its tags, and generate a filtered playlist of similar songs — then push it directly to their YouTube account.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend | Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | Google OAuth 2.0 (via Passport.js) |
| Playlist | YouTube Data API v3 (private) |

---

## File Structure

```
tagtune/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── .env
│
├── api/                        # Express.js backend
│   ├── index.js                # Entry point
│   ├── db.js                   # Supabase client
│   ├── routes/
│   │   ├── songs.js            # Song lookup by video_id
│   │   ├── recommend.js        # Recommendation logic
│   │   └── playlist.js        # YouTube playlist push
│   └── utils/
│       └── youtube.js          # YouTube API helpers
│
└── src/                        # React frontend
    ├── App.jsx
    ├── App.css
    ├── main.jsx
    └── components/
        ├── URLInput.jsx         # Step 1: URL input
        ├── SongCard.jsx         # Step 2: Song info + tags display
        ├── TagSelector.jsx      # Step 3: Tag confirm/edit
        ├── PlaylistResult.jsx   # Step 4: Result list
        └── PushButton.jsx       # YouTube push button
```

---

## Database Schema

```sql
-- Users (for Passport.js Auth)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar TEXT,
    youtube_access_token TEXT,
    youtube_refresh_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Genres (pre-populated from genre_list.txt)
CREATE TABLE genres (
    genre_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    level INTEGER NOT NULL  -- 1=primary, 2=sub, 3=micro
);

-- Artists
CREATE TABLE artists (
    artist_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Groups (e.g. BTS, BLACKPINK)
CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Albums
CREATE TABLE albums (
    album_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    artist_id INTEGER REFERENCES artists(artist_id),
    UNIQUE(title, artist_id)
);

-- Songs
CREATE TABLE songs (
    song_index SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    original_song_id INTEGER REFERENCES songs(song_index),
    artist_id INTEGER REFERENCES artists(artist_id),
    album_id INTEGER REFERENCES albums(album_id),
    group_id INTEGER REFERENCES groups(group_id),
    release_year INTEGER,
    url TEXT UNIQUE,        -- YouTube Music URL
    language TEXT
);

-- is_cover is derived: original_song_id != song_index means cover

-- Featuring artists
CREATE TABLE song_featuring (
    song_id INTEGER REFERENCES songs(song_index),
    artist_id INTEGER REFERENCES artists(artist_id),
    PRIMARY KEY (song_id, artist_id)
);

-- Producers
CREATE TABLE song_producers (
    song_id INTEGER REFERENCES songs(song_index),
    artist_id INTEGER REFERENCES artists(artist_id),
    PRIMARY KEY (song_id, artist_id)
);

-- Genre tags
CREATE TABLE song_genres (
    song_id INTEGER PRIMARY KEY REFERENCES songs(song_index),
    primary_genre_id INTEGER REFERENCES genres(genre_id),
    sub_genre_id INTEGER REFERENCES genres(genre_id),
    micro_genre_id INTEGER REFERENCES genres(genre_id)
);
```

> **Cover song logic:**
> - Original song: `original_song_id = song_index` (self-reference)
> - Cover song: `original_song_id` = the original song's `song_index`
> - `is_cover` filter → `WHERE original_song_id != song_index`

---

## User Flow

### 1. Google OAuth Login
- User logs in with Google (Authentication handled via Express.js and `passport-google-oauth20`)
- Request YouTube scope: `https://www.googleapis.com/auth/youtube` offline access
- Store access token and refresh token in `users` table
- Establish session for API calls

### 2. URL Input Screen
```
[ Paste YouTube Music link here ]  [ MAKE ]
```
- User pastes a YouTube Music URL
- Extract `video_id` from `?v=` query param
- Call backend: `GET /api/songs?video_id=xxx`

### 3. Song Card Screen
- Display song info fetched from DB:
  - Thumbnail (from YouTube)
  - Title
  - Artist
  - Current tags (primary genre, language, is_cover)
- If video_id not found in DB → show error message "Song not found in database" and ask user to input another URL.

### 4. Tag Selection Screen
- Show current tags pre-filled from DB (editable)
- **Primary tag** (required, single select):
  - Primary genre (e.g. J-pop, K-pop, Vocaloid)
- **Secondary tags** (optional, multi-select):
  - Language (Japanese / Korean / English / etc.)
  - Type: Cover only / Original only / Both
  - Sub-genre
- User can add or remove tags
- [ NEXT ] button

### 5. Playlist Result Screen
- Call backend: `POST /api/recommend` with selected tags
- Display list of recommended songs:
  - Thumbnail
  - Title + Artist
  - YouTube Music URL
  - Matched tags
  - **Match reason** (why this song was recommended):
    ```
    • Same micro genre (K-Idol EDM)
    • Same language (Korean)
    • Cover song
    ```
- Song count selector (10 / 20 / 30 / custom)
- [ Regenerate ] button → picks randomly from top 50 candidates (not just shuffle)
- [ PUT IT INTO YOUR PLAYLIST ] button (top + bottom)

### 6. YouTube Playlist Push
- Call backend: `POST /api/playlist/push`
- Backend:
  1. `POST /youtube/v3/playlists` → create new private playlist
  2. `POST /youtube/v3/playlistItems` → insert each song by `video_id`
- Frontend: `window.open(playlistUrl)` → open in browser

---

## Recommendation Logic

**Input:** selected tags from Step 4
**Output:** list of `song_index` matching the tags

### Step 1 — Hard filters (always applied)
```sql
SELECT s.song_index, s.title, s.url, s.language,
       a.name AS artist_name,
       sg.primary_genre_id, sg.sub_genre_id, sg.micro_genre_id
FROM songs s
JOIN song_genres sg ON s.song_index = sg.song_id
JOIN artists a ON s.artist_id = a.artist_id
WHERE
  sg.primary_genre_id = :primary_genre_id
  AND (:language IS NULL OR s.language = :language)
  AND (:cover_filter = 'both'
       OR (:cover_filter = 'cover' AND s.original_song_id != s.song_index)
       OR (:cover_filter = 'original' AND s.original_song_id = s.song_index))
  AND s.song_index != :seed_song_index
```

### Step 2 — Scoring (done in JS after SQL)

**Core principle:** user tags are used for filtering, seed song is used for ranking.

| Factor | Score | Notes |
|---|---|---|
| Micro genre matches seed song | +40 | Most specific — almost same vibe |
| Sub genre matches seed song | +25 | Similar style |
| Primary genre matches seed song | +10 | Same broad category |
| Same artist group as seed | +15 | e.g. same idol group |
| Same language | +10 | |
| Same release decade | +5 | |

Each matched factor is recorded for the **match reason** display in the UI.

Sort by score descending.

**Fallback:** if seed song is not in DB, skip seed-based scoring and rank by tag match only.

### Step 3 — Deduplication
- Max 2 songs per artist
- Max 2 songs per album
- From top 50 scored candidates, pick requested count randomly (for Regenerate variety)
- Limit to requested count (default 20)

### Step 4 — DB Indexes (add to schema)
```sql
CREATE INDEX idx_primary_genre ON song_genres(primary_genre_id);
CREATE INDEX idx_sub_genre ON song_genres(sub_genre_id);
CREATE INDEX idx_micro_genre ON song_genres(micro_genre_id);
CREATE INDEX idx_language ON songs(language);
CREATE INDEX idx_release_year ON songs(release_year);
```

---

## API Endpoints (Express.js)

### `GET /api/songs`
Query: `?video_id=xxx`
- Lookup song in DB by extracting video_id from url
- Returns: song info + tags

### `POST /api/recommend`
Body:
```json
{
  "seed_song_index": 42,
  "primary_genre_id": 14,
  "language": "Japanese",
  "cover_filter": "cover",
  "sub_genre_id": 162,
  "count": 20,
  "regenerate": false
}
```
Returns:
```json
[
  {
    "song_index": 123,
    "title": "Song Title",
    "artist_name": "Artist",
    "url": "https://music.youtube.com/watch?v=xxx",
    "language": "Japanese",
    "is_cover": true,
    "score": 90,
    "match_reasons": [
      "Same micro genre (Vocaloid Electro)",
      "Same language (Japanese)",
      "Cover song"
    ]
  }
]
```
- If `regenerate: true` → randomly pick from top 50 scored candidates instead of top N

### `POST /api/playlist/push`
Body:
```json
{
  "access_token": "...",
  "playlist_title": "TagTune – 2026-03-21",
  "song_urls": ["https://music.youtube.com/watch?v=xxx", ...]
}
```
Returns: `{ playlist_url: "https://youtube.com/playlist?list=xxx" }`

---

## Environment Variables

```env
# Supabase
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# YouTube Data API
YOUTUBE_API_KEY=

# Express
PORT=3001
```

---

## MVP Scope

### In scope
- Google OAuth login
- YouTube Music URL input
- Song tag display and editing
- Tag-based recommendation from DB
- YouTube playlist creation and push
- Open playlist in browser

### Out of scope (future)
- Natural language input ("something chill for late night driving")
- User preference memory
- Audio feature-based recommendation
- Mobile app
- Social / sharing features
- Songs not in the DB

---

## Known Risks

| Risk | Mitigation |
|---|---|
| video_id not found in DB | Show clear error, allow manual tag input |
| Too few results after filtering | Relax sub/micro genre filter, show warning |
| YouTube API quota (10,000 units/day) | Each playlist push uses ~N+1 units (1 create + N items) — fine for MVP |
| Google OAuth token expiry | Refresh token handling in backend |

---

## Success Criteria (MVP)

- User can log in with Google
- User can paste a YouTube Music URL and see its tags
- User can adjust tags and generate a playlist of 10–30 songs
- Generated playlist is pushed to the user's YouTube account
- Playlist opens in browser automatically