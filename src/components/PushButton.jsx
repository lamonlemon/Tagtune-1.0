import React, { useState } from 'react';
import api from '../api';

export default function PushButton({ playlistTitle, songUrls, onPushComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePush = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/playlist/push', {
        playlist_title: playlistTitle,
        song_urls: songUrls
      });
      onPushComplete(data.playlist_url);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('YouTube session expired. Please log in again.');
      } else {
        setError('Failed to push playlist to YouTube.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <button 
        onClick={handlePush}
        disabled={loading || songUrls.length === 0}
        className="btn-primary w-full shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              Push Filtered Playlist to YouTube
            </>
          )}
        </span>
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </button>
      
      {error && <p className="text-red-400 text-sm mt-3 animate-fade-in">{error}</p>}
    </div>
  );
}
