"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from "next-auth/react";
import api from '@/lib/api';

import LoginScreen from '@/components/LoginScreen';
import URLInput from '@/components/URLInput';
import SongCard from '@/components/SongCard';
import TagSelector from '@/components/TagSelector';
import PlaylistResult from '@/components/PlaylistResult';
import VectorURLInput from '@/components/VectorURLInput';

export default function App() {
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1); // 1: URL, 2: Tags, 3: Results, 4: Playlist
  const [searchMode, setSearchMode] = useState('tags'); // 'tags' or 'sound'
  
  const [seedSong, setSeedSong] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tags, setTags] = useState({ genres: [], artists: [], groups: [] });

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch tags once
      api.get('/api/tags')
        .then(res => setTags(res.data))
        .catch(console.error);
    }
  }, [status]);

  const handleLogout = () => {
    signOut();
  };

  const handleSongFound = (songData, url) => {
    setSeedSong({ ...songData, fullUrl: url });
    setStep(2);
  };

  const handleSkipToTags = () => {
    setSeedSong(null);
    setStep(3);
  };

  const handleVectorResults = (results, seed) => {
    setSeedSong(seed);
    setRecommendations(results);
    setStep(4);
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
         <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden p-4 md:p-8 bg-white text-black flex-1">
      <header className="flex justify-between items-center max-w-6xl mx-auto z-20 relative mb-12">
        <div 
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => { setStep(1); setSeedSong(null); setRecommendations([]); }}
        >
          <svg className="w-8 h-8 text-red-600 fill-current" viewBox="0 0 18 18">
            <path d="M3.166 3.161a.75.75 0 011.06 1.06 6.753 6.753 0 000 9.548.75.75 0 01-1.06 1.06 8.253 8.253 0 010-11.668Zm10.607 0a.75.75 0 011.061 0 8.251 8.251 0 010 11.668.75.75 0 01-1.06-1.06 6.752 6.752 0 000-9.547.75.75 0 010-1.06Zm-2.122 2.126a.75.75 0 011.06 0 5.25 5.25 0 010 7.424.75.75 0 01-1.06-1.06 3.75 3.75 0 000-5.303.75.75 0 010-1.06Zm-6.363-.004a.75.75 0 111.06 1.06 3.751 3.751 0 00-.813 4.088c.189.454.466.867.814 1.216a.75.75 0 01-1.06 1.06A5.253 5.253 0 013.75 8.995a5.252 5.252 0 011.538-3.712Zm5.962 3.712-3.75 2.25v-4.5l3.75 2.25Z" />
          </svg>
          <span className="text-3xl font-black tracking-tight">
            TAGTUNE
          </span>
        </div>
        <div className="flex items-center gap-4 border border-[#e5e5e5] rounded-full px-4 py-1.5">
          {session.user?.image && (
            <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full" />
          )}
          <button onClick={handleLogout} className="text-black hover:text-red-600 text-sm font-bold transition-colors uppercase">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto relative z-10 w-full flex flex-col items-center flex-1 justify-center">
        
        {step === 1 && (
          <div className="w-full flex flex-col items-center gap-8">
            <div className="flex gap-4 p-1 bg-gray-100 rounded-full border border-gray-200">
              <button 
                onClick={() => setSearchMode('tags')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${searchMode === 'tags' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
              >
                By Tags
              </button>
              <button 
                onClick={() => setSearchMode('sound')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${searchMode === 'sound' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
              >
                By Sound
              </button>
            </div>
            
            {searchMode === 'tags' ? (
              <URLInput onSongFound={handleSongFound} onSkipToTags={handleSkipToTags} />
            ) : (
              <VectorURLInput onResultsFound={handleVectorResults} />
            )}
          </div>
        )}

        {step === 2 && seedSong && (
          <div className="w-full flex flex-col items-center pb-20">
            <URLInput currentUrl={seedSong.fullUrl} />
            <SongCard song={seedSong} tagsData={tags} />
            <div className="mt-12">
               <button onClick={() => setStep(3)} className="btn-primary">CONFIRM SONG</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full flex flex-col items-center">
            <div className="mb-4 w-full">
              <URLInput currentUrl={seedSong ? seedSong.fullUrl : ''} onSongFound={(songData, url) => {
                setSeedSong({ ...songData, fullUrl: url });
                setStep(2);
              }} />
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
