import React from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginScreen() {
  const handleLogin = () => {
    signIn('google');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-3.5 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <svg className="w-8 h-8 text-red-600 fill-current" viewBox="0 0 18 18">
              <path d="M3.166 3.161a.75.75 0 011.06 1.06 6.753 6.753 0 000 9.548.75.75 0 01-1.06 1.06 8.253 8.253 0 010-11.668Zm10.607 0a.75.75 0 011.061 0 8.251 8.251 0 010 11.668.75.75 0 01-1.06-1.06 6.752 6.752 0 000-9.547.75.75 0 010-1.06Zm-2.122 2.126a.75.75 0 011.06 0 5.25 5.25 0 010 7.424.75.75 0 01-1.06-1.06 3.75 3.75 0 000-5.303.75.75 0 010-1.06Zm-6.363-.004a.75.75 0 111.06 1.06 3.751 3.751 0 00-.813 4.088c.189.454.466.867.814 1.216a.75.75 0 01-1.06 1.06A5.253 5.253 0 013.75 8.995a5.252 5.252 0 011.538-3.712Zm5.962 3.712-3.75 2.25v-4.5l3.75 2.25Z" />
            </svg>
            <span className="text-xl font-black tracking-tight text-slate-950">
              TAGTUNE
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-red-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-red-600 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-red-600 transition-colors">FAQ</a>
          </nav>

          <button 
            onClick={handleLogin}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-full text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-[0.98] shadow-sm"
          >
            <svg className="w-4 h-4 bg-white rounded-full" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center relative z-10">

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 leading-[1.1] mb-6">
            Take Control of Your <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff1a47] to-[#fe0000]">
              YouTube Music
            </span> Playlists
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            YouTube Music's autoplay mixes in unrelated tracks, and your standard playlists repeat the same loops. TagTune solves this. Seed a custom playlist with a song you love, filter by precise tags, and export the generated mix directly to your YouTube library.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-red-600 text-white font-black tracking-wide hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-base shadow-md"
            >
              <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Get Started with Google
            </button>
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center shadow-sm"
            >
              Learn how it works
            </a>
          </div>

          {/* Simple Bullet Value Badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-slate-500 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No Autoplay Noise
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Granular Tag Filters
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              One-Click YouTube Export
            </span>
          </div>
        </div>

        {/* Visual Mockup Container representing the app's capability */}
        <div className="max-w-5xl mx-auto mt-16 overflow-hidden rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
          <img 
            src="/assets/visual_mockup.png" 
            alt="TagTune App Interface Mockup" 
            className="w-full h-auto object-cover block"
          />
        </div>
      </section>

      {/* Value Prop / Features Section */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-2">Designed for Music Lovers</h2>
          <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
            Why use TagTune instead of general YouTube Music mixes?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Granular Tag Filters</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Define exact boundaries. Filter by Primary Genre, Language (e.g. Japanese, Korean, English), and cover song preferences. Zero chance of unexpected styles playing next.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Smart Similarity Scoring</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We rank potential recommendations using detailed similarity vectors: micro-genres (e.g., Vocaloid Electro, Idol EDM), release eras, and associated artist groups.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Direct YouTube Export</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Once you're satisfied with your recommended playlist mix, export it as a private playlist. It loads straight into your library, accessible on any YouTube Music client.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-100 border-t border-b border-slate-200 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-2">Three Simple Steps</h2>
            <p className="text-3xl font-black tracking-tight text-slate-950">How TagTune Builds Your Mixes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-14 h-14 rounded-full bg-white border-2 border-red-600 flex items-center justify-center font-black text-xl text-red-600 shadow-md mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Link Your Library</h3>
              <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
                Connect your account securely via Google OAuth. This grants permission to export custom-built playlists directly to your YouTube Music profile.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-14 h-14 rounded-full bg-white border-2 border-red-600 flex items-center justify-center font-black text-xl text-red-600 shadow-md mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Select a Seed & Tags</h3>
              <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
                Paste the URL of a song you love or search by audio features. Refine the database-fetched tags, specify language limits, and covers options.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-14 h-14 rounded-full bg-white border-2 border-red-600 flex items-center justify-center font-black text-xl text-red-600 shadow-md mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Generate & Export</h3>
              <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
                Review the matched recommendations and details on why they align. Click 'Push to YouTube' to immediately output your new private playlist.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-2">Have Questions?</h2>
            <p className="text-3xl font-black tracking-tight text-slate-950">Frequently Asked Questions</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h4 className="text-base font-bold text-slate-950 mb-2">Why do I need to log in with a Google Account?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                TagTune integrates directly with YouTube Music. To export the playlists we generate, Google requires authorization so that we can legally and securely write those tracks to your account library on your behalf.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h4 className="text-base font-bold text-slate-950 mb-2">Are my private playlists visible to others?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                No. Any playlist created by TagTune is initialized with "Private" visibility settings on YouTube by default. You are the only person who can view it, unless you explicitly decide to share it via your YouTube client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white text-center px-4 sm:px-8 border-t border-slate-200">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 mb-6">
            Ready to generate your first custom mix?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
            Sign in with your Google account to access your personal seed song inputs, tags, and start pushing custom playlists back to YouTube.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full sm:w-auto mx-auto px-8 py-4 rounded-full bg-red-600 text-white font-black tracking-wide hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-base shadow-md shadow-red-500/10"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign In and Start Generating
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-lg font-black tracking-tight text-white block mb-1">TAGTUNE</span>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} TagTune. All rights reserved. <br />
              Google, YouTube, and YouTube Music are registered trademarks of Google LLC.
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
