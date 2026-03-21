import React from 'react';

export default function SongCard({ song, tagsData }) {
  if (!song) return null;

  // Render nicely formatted tags
  const renderTags = () => {
    const tagsToRender = [];

    if (tagsData?.genres) {
      const primary = tagsData.genres.find(x => x.genre_id === song.primary_genre_id)?.name;
      const sub = tagsData.genres.find(x => x.genre_id === song.sub_genre_id)?.name;
      const micro = tagsData.genres.find(x => x.genre_id === song.micro_genre_id)?.name;
      if (primary) tagsToRender.push(<span key={`pg-${primary}`} className="tag-chip">{primary}</span>);
      if (sub) tagsToRender.push(<span key={`sg-${sub}`} className="tag-chip">{sub}</span>);
      if (micro) tagsToRender.push(<span key={`mg-${micro}`} className="tag-chip">{micro}</span>);
    }

    if (tagsData?.groups && song.group_id) {
      const group = tagsData.groups.find(x => x.group_id === song.group_id)?.name;
      if (group) tagsToRender.push(<span key={`grp-${group}`} className="tag-chip border-red-500 text-red-600 bg-red-50">Group: {group}</span>);
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

    return tagsToRender;
  };

  return (
    <div className="w-full flex items-start gap-6 mt-12 animate-fade-in pl-4 md:pl-10">
      {/* Gray Placeholder for Album Art */}
      <div className="w-[300px] h-[180px] bg-[#e5e5e5] flex-shrink-0 flex items-center justify-center overflow-hidden">
         <img 
            src={song.thumbnail} 
            alt={song.title} 
            className="w-full h-full object-cover opacity-80 mix-blend-multiply"
          />
      </div>

      <div className="flex flex-col gap-2 p-2">
        <h3 className="text-2xl font-bold uppercase">{song.title}</h3>
        <p className="text-sm text-gray-500 mb-2 truncate max-w-sm" title={song.url}>{song.url}</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
           {renderTags()}
           {song.is_cover && (
             <span className="tag-chip">Cover</span>
           )}
           {song.language && (
             <span className="tag-chip">{song.language}</span>
           )}
        </div>
      </div>
    </div>
  );
}
