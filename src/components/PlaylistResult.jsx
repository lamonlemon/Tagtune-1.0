import React, { useState } from 'react';
import api from '../api';
// Helper to extract video ID from YouTube/YouTube Music URLs
const extractId = (urlStr) => {
  try {
    const u = new URL(urlStr);
    return u.searchParams.get('v') || u.pathname.slice(1);
  } catch { return urlStr; }
};

export default function PlaylistResult({ recommendations, seedSong, onRestart, tagsData }) {
  const [isPushing, setIsPushing] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState(null);
  const [error, setError] = useState(null);

  const handlePush = async () => {
    setIsPushing(true);
    setError(null);
    try {
      const payload = {
        title: `TagTune: ${seedSong?.title || 'Custom Playlist'} Recommendations`,
        description: `Generated based on tags!`,
        video_ids: recommendations.map(s => extractId(s.url)).filter(Boolean)
      };
      
      const res = await api.post('/api/playlist/push', payload);
      setPlaylistUrl(res.data.playlist_url);
      window.open(res.data.playlist_url, '_blank');
    } catch (err) {
      console.error(err);
      setError('Failed to create YouTube playlist. Make sure you granted permissions!');
    } finally {
      setIsPushing(false);
    }
  };

  const renderTags = (song) => {
    if (!tagsData) return null;
    const tagsToRender = [];

    if (tagsData?.genres) {
      const primary = tagsData.genres.find(x => x.genre_id === song.song_primary_genres)?.name;
      const sub = tagsData.genres.find(x => x.genre_id === song.song_sub_genres)?.name;
      const micro = tagsData.genres.find(x => x.genre_id === song.song_micro_genres)?.name;
      if (primary) tagsToRender.push(<span key={`pg-${primary}`} className="tag-chip tag-chip border-red-500 text-red-600 bg-red-50">Primary Genre: {primary}</span>);
      if (sub) tagsToRender.push(<span key={`sg-${sub}`} className="tag-chip tag-chip border-red-500 text-red-600 bg-red-50">Sub Genre: {sub}</span>);
      if (micro) tagsToRender.push(<span key={`mg-${micro}`} className="tag-chip tag-chip border-red-500 text-red-600 bg-red-50">Micro Genre: {micro}</span>);
    }

    if (tagsData?.artists) {
      const mainArt = tagsData.artists.find(x => x.artist_id === song.artist_id)?.name;
      if (mainArt) tagsToRender.push(<span key={`art-${mainArt}`} className="tag-chip border-blue-500 text-blue-600 bg-blue-50">Artist: {mainArt}</span>);
      
      song.song_featuring?.forEach(f => {
        const feat = tagsData.artists.find(x => x.artist_id === f.artist_id)?.name;
        if (feat) tagsToRender.push(<span key={`feat-${feat}`} className="tag-chip border-purple-500 text-purple-600 bg-purple-50">Feat: {feat}</span>);
      });
      
      song.song_producers?.forEach(p => {
        const prod = tagsData.artists.find(x => x.artist_id === p.artist_id)?.name;
        if (prod) tagsToRender.push(<span key={`prod-${prod}`} className="tag-chip border-green-500 text-green-600 bg-green-50">Prod: {prod}</span>);
      });
    }

    if (tagsData?.groups && song.group_id) {
      const group = tagsData.groups.find(x => x.group_id === song.group_id)?.name;
      if (group) tagsToRender.push(<span key={`grp-${group}`} className="tag-chip border-orange-500 text-orange-600 bg-orange-50">Group: {group}</span>);
    }
    
    if (song.is_cover) tagsToRender.push(<span key={`cover`} className="tag-chip border-gray-500 text-gray-600 bg-gray-50">Cover</span>);
    if (song.language) tagsToRender.push(<span key={`language-${song.language}`} className="tag-chip border-yellow-500 text-yellow-600 bg-yellow-50">Language: {song.language}</span>);

    return tagsToRender;
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col animate-fade-in relative z-10 px-4 py-10">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b-2 border-[#e5e5e5] mb-10">
        <h2 className="text-4xl font-black uppercase underline decoration-[#00a2ff] decoration-4 underline-offset-8">
          YOUR PLAYLIST IS READY!
        </h2>
        
        {playlistUrl ? (
          <a href={playlistUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
            OPEN PLAYLIST
          </a>
        ) : (
          <button 
            onClick={handlePush} 
            disabled={isPushing} 
            className="btn-primary min-w-[280px]"
          >
            {isPushing ? "CREATING..." : "PUT IT INTO YOUR PLAYLIST"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 text-red-600 font-bold">{error}</div>
      )}

      <div className="flex flex-col gap-8">
        {recommendations.map((song, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row gap-6 items-start">
             {/* Thumbnail */}
             <div className="w-[200px] h-[120px] bg-[#e5e5e5] flex-shrink-0 flex items-center justify-center overflow-hidden rounded-sm relative">
                <img src={`https://img.youtube.com/vi/${extractId(song.url)}/hqdefault.jpg`} alt={song.title} className="w-full h-full object-cover"></img>
                <span className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded">{idx + 1}</span>
             </div>
             <div className="flex flex-col justify-center py-2 gap-1">
                <h3 className="text-xl font-bold uppercase">{song.title}</h3>
                <p className="text-sm text-gray-500 mb-1">{song.url}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {renderTags(song)}
                </div>
                <p className="text-xs text-black font-semibold mt-2 break-words">Match: {song.match_reasons?.join(', ')}</p>
             </div>
          </div>
        ))}
      </div>
      
      <div className="mt-16 text-center border-t-2 border-[#e5e5e5] pt-10">
         <button onClick={onRestart} className="btn-secondary">
           Start Over
         </button>
      </div>

    </div>
  );
}
