"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from "next-auth/react";
import api from '@/lib/api';

import LoginScreen from '@/components/LoginScreen';
import URLInput from '@/components/URLInput';
import SongCard from '@/components/SongCard';
import TagSelector from '@/components/TagSelector';
import PlaylistResult from '@/components/PlaylistResult';

export default function App() {
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1); // 1: URL, 2: Tags, 3: Results
  
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
      {/* Header */}
      <header className="flex justify-between items-center max-w-6xl mx-auto z-20 relative mb-12">
        <h1 
          className="text-3xl font-black cursor-pointer tracking-tight"
          onClick={() => { setStep(1); setSeedSong(null); setRecommendations([]); }}
        >
          TAGTUNE
        </h1>
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
          <URLInput onSongFound={handleSongFound} onSkipToTags={handleSkipToTags} />
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
