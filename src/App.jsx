import React, { useState, useEffect } from 'react';
import api from './api';

import LoginScreen from './components/LoginScreen';
import URLInput from './components/URLInput';
import SongCard from './components/SongCard';
import TagSelector from './components/TagSelector';
import PlaylistResult from './components/PlaylistResult';

function App() {
  const [authStatus, setAuthStatus] = useState({ checked: false, authenticated: false, user: null });
  const [step, setStep] = useState(1); // 1: URL, 2: Tags, 3: Results
  
  const [seedSong, setSeedSong] = useState(null);
  const [recommendations, setRecommendations] = useState([]); // Changed to empty array
  const [isGenerating, setIsGenerating] = useState(false);
  const [tags, setTags] = useState({ genres: [], artists: [], groups: [] }); // Consolidated tags

  useEffect(() => {
    // Check auth status
    api.get('/auth/status')
      .then(res => setAuthStatus({ checked: true, ...res.data }))
      .catch(err => setAuthStatus({ checked: true, authenticated: false }));

    // Fetch tags once
    api.get('/api/tags')
      .then(res => setTags(res.data))
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    await api.post('/auth/logout');
    setAuthStatus({ checked: true, authenticated: false, user: null });
    setStep(1);
    setSeedSong(null);
    setRecommendations(null);
  };

  const handleSongFound = (songData, url) => {
    setSeedSong({ ...songData, fullUrl: url });
    setStep(2);
  };

  const handleSkipToTags = () => {
    setSeedSong(null);
    setStep(3); // Go straight to tags
  };

  const handleGenerate = async (tags) => {
    setIsGenerating(true);
    try {
      const payload = {
        seed_song_index: seedSong ? seedSong.song_index : null,
        ...tags
      };
      const res = await api.post('/api/recommend', payload);
      setRecommendations(res.data);
      setStep(4);
    } catch (err) {
      console.error(err);
      alert('Failed to generate recommendations.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      // Re-use current tags but ask for regenerate from backend
      // We don't have the exact tags stored in a top-level state easily, 
      // but we can just go back to step 2 or ideally store tags in App state.
      // For MVP, just going back to step 2 is easiest if they want to regenerate with different tags,
      // OR we can pass `regenerate: true` if we saved `lastTags`. Let's just go back to Step 2 for simplicity.
      setStep(2);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!authStatus.checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
         <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!authStatus.authenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden p-4 md:p-8 bg-white text-black">
      {/* Header */}
      <header className="flex justify-between items-center max-w-6xl mx-auto z-20 relative mb-12">
        <h1 
          className="text-3xl font-black cursor-pointer tracking-tight"
          onClick={() => { setStep(1); setSeedSong(null); setRecommendations(null); }}
        >
          TAGTUNE
        </h1>
        <div className="flex items-center gap-4 border border-[#e5e5e5] rounded-full px-4 py-1.5 shadow-sm">
          {authStatus.user?.avatar && (
            <img src={authStatus.user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
          )}
          <button onClick={handleLogout} className="text-black hover:text-red-600 text-sm font-bold transition-colors uppercase">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto relative z-10 w-full flex flex-col items-center">
        
        {step === 1 && (
          <URLInput onSongFound={handleSongFound} onSkipToTags={handleSkipToTags} />
        )}

        {step === 2 && seedSong && (
          <div className="w-full flex flex-col items-center pb-20">
            <URLInput currentUrl={seedSong.fullUrl} />
            <SongCard song={seedSong} tagsData={tags} />
            <div className="mt-12">
               <button onClick={() => setStep(3)} className="btn-primary w-48 shadow-md">CONFIRM SONG</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full flex flex-col items-center">
            <div className="mb-4 w-full">
              <URLInput currentUrl={seedSong ? seedSong.fullUrl : ''} />
            </div>
            <TagSelector initialTags={seedSong || {}} onGenerate={handleGenerate} tagsData={tags} />
          </div>
        )}

        {step === 4 && (
          <PlaylistResult recommendations={recommendations} tagsData={tags} seedSong={seedSong} onRestart={() => {
            setStep(1);
            setSeedSong(null);
            setRecommendations([]);
          }} />
        )}

        {/* Global Loading Overlay for Generate */}
        {isGenerating && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-black font-bold animate-pulse text-lg uppercase tracking-wide">MAKING PLAYLIST...</p>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
