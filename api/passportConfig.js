import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { supabase } from './db.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      // Find or create user in Supabase
      const googleId = profile.id;
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const avatar = profile.photos[0]?.value;

      let { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('google_id', googleId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching user:', fetchError);
        return cb(fetchError, null);
      }

      if (!user) {
        // Create new
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            google_id: googleId,
            email: email,
            name: name,
            avatar: avatar,
            youtube_access_token: accessToken,
            youtube_refresh_token: refreshToken
          }])
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating user:', insertError);
          return cb(insertError, null);
        }
        user = newUser;
      } else {
        // Update tokens
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            youtube_access_token: accessToken,
            ...(refreshToken && { youtube_refresh_token: refreshToken }) // Only update if a new refresh token is provided
          })
          .eq('google_id', googleId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user tokens:', updateError);
          return cb(updateError, null);
        }
        user = updatedUser;
      }

      return cb(null, user);
    } catch (err) {
      console.error('Passport verify error:', err);
      return cb(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return done(error, null);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
