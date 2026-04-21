import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { supabase } from "@/lib/supabase"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile email https://www.googleapis.com/auth/youtube",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;
      
      try {
        const googleId = profile.sub; // Google ID
        const email = profile.email;
        const name = profile.name;
        const avatar = profile.picture;
        const accessToken = account.access_token;
        const refreshToken = account.refresh_token;

        // Check if user exists in Supabase
        const { data: dbUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('google_id', googleId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching user from Supabase:', fetchError);
          return true; // Still allow sign in even if DB sync fails
        }

        if (!dbUser) {
          // Create new user
          await supabase.from('users').insert([{
            google_id: googleId,
            email: email,
            name: name,
            avatar: avatar,
            youtube_access_token: accessToken,
            youtube_refresh_token: refreshToken
          }]);
        } else {
          // Update tokens
          await supabase.from('users').update({
            youtube_access_token: accessToken,
            ...(refreshToken && { youtube_refresh_token: refreshToken })
          }).eq('google_id', googleId);
        }
        
        // Add DB id to user object so it gets into JWT
        if (dbUser) user.dbId = dbUser.id;
        
        return true;
      } catch (err) {
        console.error('Error in signIn callback:', err);
        return true;
      }
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at; // unix timestamp
      }

      // 만료 10분 전이면 갱신
      if (Date.now() < (token.expiresAt - 60 * 10) * 1000) {
        return token; // 아직 유효
      }

      // refresh token으로 갱신
      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken,
          }),
        });
        const tokens = await response.json();
        token.accessToken = tokens.access_token;
        token.expiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in;

        // Supabase도 업데이트
        await supabase.from('users').update({
          youtube_access_token: tokens.access_token
        }).eq('google_id', token.sub);

      } catch (e) {
        console.error('Token refresh failed:', e);
        token.error = 'RefreshTokenError';
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      if (token.dbId) {
        session.user.id = token.dbId;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
})
