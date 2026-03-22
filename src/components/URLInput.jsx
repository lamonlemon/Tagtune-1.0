import React, { useState } from 'react';
import api from '../api';

export default function URLInput({ onSongFound, onSkipToTags, currentUrl = '' }) {
  const [url, setUrl] = useState(currentUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractVideoId = (inputUrl) => {
    try {
      const parsedUrl = new URL(inputUrl);
      let v = parsedUrl.searchParams.get('v');
      if (!v && parsedUrl.hostname === 'youtu.be') {
        v = parsedUrl.pathname.slice(1);
      }
      return v;
    } catch {
      return null;
    }
  };

  const handleMakePlaylist = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Please enter a valid YouTube or YouTube Music URL.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/api/songs?video_id=${videoId}`);
      onSongFound(response.data, url);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setError('Song not found in database.');
      } else {
        setError('An error occurred while looking up the song.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = url.trim().length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-fade-in relative z-10">
      
      <form onSubmit={handleMakePlaylist} className="w-full flex flex-col sm:flex-row gap-4 items-center justify-center relative">
        <div className="relative w-full sm:w-[500px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#FF0000]">
               <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
             </svg>
          </div>
          <input 
            type="text" 
            placeholder="Paste Youtube Music Link" 
            className="input-field pl-12 w-full"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !isValidUrl}
          className={`${isValidUrl ? 'btn-primary' : 'btn-secondary'} whitespace-nowrap min-w-[120px]`}
        >
          {loading ? "..." : "MAKE"}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-[#FF0000] font-medium text-center">
          {error}
        </div>
      )}

      {/* Only show OR block if we are rendering for step 1 (where we pass onSkipToTags natively) */}
      {onSkipToTags && (
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center justify-center w-full max-w-md my-12">
            <div className="h-[1px] bg-gray-200 flex-1"></div>
            <span className="px-6 text-sm text-gray-400 font-medium tracking-widest uppercase">Or</span>
            <div className="h-[1px] bg-gray-200 flex-1"></div>
          </div>
          <button 
            type="button"
            onClick={onSkipToTags}
            className="px-8 py-3 rounded-full border-2 border-[#e5e5e5] text-black hover:border-black font-bold tracking-wide transition-colors focus:outline-none"
          >
            START WITH SELECTING TAG
          </button>
        </div>
      )}
    </div>
  );
}
