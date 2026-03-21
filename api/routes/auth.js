import express from 'express';
import passport from 'passport';

const router = express.Router();

// Start Google OAuth login
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube'],
    accessType: 'offline', // Request refresh token
    prompt: 'consent' // Force physical consent to get refresh token reliably
  })
);

// Callback after Google OAuth authentication
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=true' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:5173/'); // Redirect to frontend
  }
);

// Check current user status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.json({ success: true });
  });
});

export default router;
