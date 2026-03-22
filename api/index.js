import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Internal route imports
import authRoutes from './routes/auth.js';
import songsRoutes from './routes/songs.js';
import recommendRoutes from './routes/recommend.js';
import playlistRoutes from './routes/playlist.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env'), quiet: true });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

import './passportConfig.js'; // Configure passport strategies

// Routes
app.use('/auth', authRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/playlist', playlistRoutes);

import { supabase } from './db.js';
app.get('/api/tags', async (req, res) => {
  try {
    const [genresRes, artistsRes, groupsRes] = await Promise.all([
      supabase.from('genres').select('*').order('name'),
      supabase.from('artists').select('*').order('name'),
      supabase.from('groups').select('*').order('name')
    ]);
    res.json({
      genres: genresRes.data || [],
      artists: artistsRes.data || [],
      groups: groupsRes.data || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
