-- Initialize TagTune Database Schema

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
-- NOTE: PRD states this is already populated, leaving it here for completeness
CREATE TABLE IF NOT EXISTS genres (
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

-- Indexes for performance
CREATE INDEX idx_primary_genre ON song_genres(primary_genre_id);
CREATE INDEX idx_sub_genre ON song_genres(sub_genre_id);
CREATE INDEX idx_micro_genre ON song_genres(micro_genre_id);
CREATE INDEX idx_language ON songs(language);
CREATE INDEX idx_release_year ON songs(release_year);
