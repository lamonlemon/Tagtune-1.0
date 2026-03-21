import React, { useState } from 'react';
import api from '../api';

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
        video_ids: recommendations.map(s => s.url)
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

    if (tagsData.genres && song.song_genres) {
      const g = song.song_genres;
      const primary = tagsData.genres.find(x => x.genre_id === g.primary_genre_id)?.name;
      const sub = tagsData.genres.find(x => x.genre_id === g.sub_genre_id)?.name;
      const micro = tagsData.genres.find(x => x.genre_id === g.micro_genre_id)?.name;
      if (primary) tagsToRender.push(<span key={`pg-${primary}`} className="tag-chip text-xs py-0.5">{primary}</span>);
      if (sub) tagsToRender.push(<span key={`sg-${sub}`} className="tag-chip text-xs py-0.5">{sub}</span>);
      if (micro) tagsToRender.push(<span key={`mg-${micro}`} className="tag-chip text-xs py-0.5">{micro}</span>);
    }

    if (tagsData.groups && song.group_id) {
      const group = tagsData.groups.find(x => x.group_id === song.group_id)?.name;
      if (group) tagsToRender.push(<span key={`grp-${group}`} className="tag-chip text-xs py-0.5 border-red-500 text-red-600 bg-red-50">Group: {group}</span>);
    }

    if (tagsData.artists) {
      const mainArt = tagsData.artists.find(x => x.artist_id === song.artist_id)?.name;
      if (mainArt) tagsToRender.push(<span key={`art-${mainArt}`} className="tag-chip text-xs py-0.5 border-blue-500 text-blue-600 bg-blue-50">Artist: {mainArt}</span>);
      
      song.song_featuring?.forEach(f => {
        const feat = tagsData.artists.find(x => x.artist_id === f.artist_id)?.name;
        if (feat) tagsToRender.push(<span key={`feat-${feat}`} className="tag-chip text-xs py-0.5 border-purple-500 text-purple-600 bg-purple-50">Feat: {feat}</span>);
      });
      
      song.song_producers?.forEach(p => {
        const prod = tagsData.artists.find(x => x.artist_id === p.artist_id)?.name;
        if (prod) tagsToRender.push(<span key={`prod-${prod}`} className="tag-chip text-xs py-0.5 border-green-500 text-green-600 bg-green-50">Prod: {prod}</span>);
      });
    }

    if (song.is_cover) tagsToRender.push(<span key="cover" className="tag-chip text-xs py-0.5">Cover</span>);
    if (song.language) tagsToRender.push(<span key="lang" className="tag-chip text-xs py-0.5">{song.language}</span>);

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
            className="btn-primary shadow-md min-w-[280px]"
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
                <img src={`https://img.youtube.com/vi/${song.url}/hqdefault.jpg`} className="w-full h-full object-cover opacity-80 mix-blend-multiply" alt=""/>
                <span className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded">{idx + 1}</span>
             </div>
             <div className="flex flex-col justify-center py-2 gap-1">
                <h3 className="text-xl font-bold uppercase">{song.title}</h3>
                <p className="text-sm text-gray-500 mb-1">{`https://music.youtube.com/watch?v=${song.url}`}</p>
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
