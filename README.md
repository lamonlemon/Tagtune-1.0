# TagTune 🎵

TagTune is a modern, minimalist music recommendation and playlist curation tool. It bridges the gap between YouTube Music and a curated database of music metadata to help you discover new tracks and instantly sync them to your YouTube account.

## Features

-   **Seamless Authentication:** Securely login using your Google account via OAuth 2.0.
-   **Smart Metadata Lookup:** Paste a YouTube Music link to instantly retrieve detailed information including:
    -   **Genres:** Primary, Sub, and Micro-genres.
    -   **Artists:** Main artist, Featuring artists, and Producers.
    -   **Tags:** Artists Groups, Language, and Release Decade.
-   **Advanced Recommendation Engine:** A custom scoring algorithm that identifies similar songs based on deep metadata matching.
-   **One-Click Playlist Sync:** Automatically create and push a new private playlist containing the recommendations directly to your YouTube account.
-   **Minimalist Design:** A clean, focused interface featuring a modern white-and-red theme.

## Technical Stack

-   **Frontend:**
    -   React 19 (Vite)
    -   Tailwind CSS (Vanilla CSS for custom styling)
    -   Axios for API communication
-   **Backend:**
    -   Node.js & Express
    -   Passport.js with Google OAuth 2.0 strategy
    -   YouTube Data API v3 (Google APIs)
-   **Database:**
    -   Supabase (PostgreSQL) for music metadata storage and lookup.

## Project Structure

```text
├── api/                # Express backend (API routes and logic)
│   ├── routes/         # API endpoints (Auth, Recommend, Playlist, Songs)
│   └── index.js        # Server entry point
├── src/                # React frontend source
│   ├── components/     # UI Components (SongCard, TagSelector, etc.)
│   └── App.jsx         # Main application flow and state
├── .env                # Environment variables (Google, YouTube, Supabase)
├── schema.sql          # Database schema for Supabase
└── README.md           # Project documentation
```

## 🛠️ Getting Started

### 1. Prerequisites
-   Node.js (v18 or higher recommended)
-   A Google Cloud Project with YouTube Data API v3 enabled and OAuth 2.0 credentials.
-   A Supabase project with the provided `schema.sql` applied.

### 2. Environment Setup
Create a `.env` file in the root directory with the following variables:
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret

# YouTube API (If different from OAuth)
YOUTUBE_CLIENT_ID=your_google_client_id
YOUTUBE_CLIENT_SECRET=your_google_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

### 3. Installation
```bash
# Install dependencies
npm install
```

### 4. Running the Application
You will need two terminal windows:

**Terminal 1: Start the Backend Server**
```bash
node api/index.js
```

**Terminal 2: Start the Frontend (Vite)**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Database Schema
The project uses a structured PostgreSQL schema to manage musicians, groups, albums, and tracks. See [schema.sql](schema.sql) for the complete definition.
