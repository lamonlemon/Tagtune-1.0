import React, { useState, useEffect, useMemo } from 'react';

export default function VectorFilterSelector({ seedSong, onGenerate, onBack, tagsData = { genres: [], artists: [], groups: [] } }) {
  const [primaryTags, setPrimaryTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxSongs, setMaxSongs] = useState(20);
  const [dragOverTarget, setDragOverTarget] = useState(null);

  const removeTag = (tag) => {
    setPrimaryTags(prev => prev.filter(t => t.id !== tag.id));
  };

  const addTag = (tag) => {
    if (!primaryTags.some(t => t.id === tag.id)) {
      setPrimaryTags(prev => [...prev, tag]);
    }
  };

  const handleDragStart = (e, tag, source) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ tag, source }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOverTarget(null);
    try {
      const { tag, source } = JSON.parse(e.dataTransfer.getData('application/json'));
      if (source === 'available') {
        addTag(tag);
      }
    } catch {}
  };

  const allTags = useMemo(() => {
    return [
      ...tagsData.genres.map(g => {
        let displayType = 'Genre';
        if (g.level === 1) displayType = 'Primary Genre';
        else if (g.level === 2) displayType = 'Sub Genre';
        else if (g.level === 3) displayType = 'Micro Genre';
        return { id: `genre_${g.genre_id}`, name: g.name, type: displayType, data: g };
      }),
      ...tagsData.artists.map(a => ({ id: `artist_${a.artist_id}`, name: a.name, type: 'Artist', data: a })),
      ...tagsData.artists.map(a => ({ id: `feat_${a.artist_id}`, name: a.name, type: 'Featuring', data: a })),
      ...tagsData.artists.map(a => ({ id: `prod_${a.artist_id}`, name: a.name, type: 'Producer', data: a })),
      ...tagsData.groups.map(g => ({ id: `group_${g.group_id}`, name: g.name, type: 'Group', data: g })),
      { id: 'lang_Korean', name: 'Korean', type: 'Language' },
      { id: 'lang_Japanese', name: 'Japanese', type: 'Language' },
      { id: 'lang_English', name: 'English', type: 'Language' },
      { id: 'lang_Instrumental', name: 'Instrumental', type: 'Language' },
      { id: 'type_Cover', name: 'Cover', type: 'Type' },
      { id: 'type_Original', name: 'Original', type: 'Type' }
    ];
  }, [tagsData]);

  // Pre-populate with seed song language on mount or when song/tags list updates
  useEffect(() => {
    if (!allTags || allTags.length === 0 || !seedSong) return;

    const initialPrimary = [];
    if (seedSong.language) {
      const langTag = allTags.find(t => t.id === `lang_${seedSong.language}`);
      if (langTag) {
        initialPrimary.push(langTag);
      }
    }

    setPrimaryTags(initialPrimary);
  }, [seedSong, allTags]);

  const availableTags = useMemo(() => {
    let filtered = allTags.filter(tag => {
      const isSelected = primaryTags.some(t => t.id === tag.id);
      if (isSelected) return false;
      if (searchTerm) {
        return tag.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               tag.type.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered.sort((a, b) => {
        const aExact = a.name.toLowerCase() === term ? 0 : 1;
        const bExact = b.name.toLowerCase() === term ? 0 : 1;
        return aExact - bExact;
      });
    }
    return filtered.slice(0, 50);
  }, [allTags, primaryTags, searchTerm]);

  const mapTags = (tagsList) => {
    const primaryGenres = tagsList.filter(t => t.type === 'Primary Genre').map(t => t.data.genre_id);
    const subGenres = tagsList.filter(t => t.type === 'Sub Genre').map(t => t.data.genre_id);
    const microGenres = tagsList.filter(t => t.type === 'Micro Genre').map(t => t.data.genre_id);
    const languages = tagsList.filter(t => t.type === 'Language').map(t => t.name);
    const coverTags = tagsList.filter(t => t.type === 'Type').map(t => t.name.toLowerCase());
    const artists = tagsList.filter(t => t.type === 'Artist').map(t => t.data.artist_id);
    const feats = tagsList.filter(t => t.type === 'Featuring').map(t => t.data.artist_id);
    const prods = tagsList.filter(t => t.type === 'Producer').map(t => t.data.artist_id);
    const groups = tagsList.filter(t => t.type === 'Group').map(t => t.data.group_id);

    return {
      primary_genre_ids: primaryGenres,
      sub_genre_ids: subGenres,
      micro_genre_ids: microGenres,
      languages,
      cover_filter: coverTags.length > 0 ? coverTags[0] : null,
      artist_ids: artists,
      feat_artist_ids: feats,
      prod_artist_ids: prods,
      group_ids: groups,
    };
  };

  const handleGenerate = () => {
    onGenerate({
      primary_tags: mapTags(primaryTags),
      count: maxSongs
    });
  };

  const extractId = (urlStr) => {
    try {
      const u = new URL(urlStr);
      return u.searchParams.get('v') || u.pathname.slice(1);
    } catch { return ''; }
  };

  return (
    <div className="w-full flex justify-center pb-10 animate-fade-in">
      <div className="w-full max-w-5xl">
         
         {/* Top Bar */}
         <div className="flex justify-between items-center mb-6 px-4 lg:px-0">
           <button 
             onClick={onBack} 
             className="flex items-center gap-2 text-sm text-gray-500 hover:text-black font-bold uppercase transition-colors"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
             Back
           </button>
           <button 
             onClick={handleGenerate} 
             className="btn-primary px-8 py-2 text-sm flex items-center justify-center"
           >
             GENERATE
           </button>
         </div>

         {/* Seed Song Card Banner */}
         {seedSong && (
           <div className="mx-4 lg:mx-0 mb-6 bg-gray-50 border border-[#e5e5e5] rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-4">
             <div className="w-full sm:w-[120px] aspect-[16/10] bg-[#e5e5e5] rounded-xl overflow-hidden relative flex-shrink-0">
               {extractId(seedSong.url) ? (
                 <img 
                   src={`https://img.youtube.com/vi/${extractId(seedSong.url)}/hqdefault.jpg`} 
                   alt={seedSong.title} 
                   className="w-full h-full object-cover" 
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                   No Image
                 </div>
               )}
             </div>
             <div className="text-center sm:text-left">
               <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Similarity Seed Song</span>
               <h3 className="font-bold text-lg uppercase truncate leading-tight mt-0.5">{seedSong.title}</h3>
               <p className="text-sm font-semibold text-red-600 truncate mt-0.5">{seedSong.artist_name}</p>
             </div>
           </div>
         )}

         {/* Grid Layout: matches TagSelector.jsx but with only primary column */}
         <div className="flex flex-col lg:flex-row gap-6 px-4 lg:px-0">
           
           {/* Left Column: Primary Tag Panel & Size Slider */}
           <div className="flex-1 flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Primary tag filters</h3>
                <div 
                   className={`w-full min-h-[220px] bg-[#e5e5e5] rounded-3xl p-4 flex flex-wrap gap-2 items-start content-start transition-all ${
                     dragOverTarget === 'primary' ? 'ring-2 ring-red-400 bg-red-50' : ''
                   }`}
                   onDragOver={(e) => { handleDragOver(e); setDragOverTarget('primary'); }}
                   onDragLeave={() => setDragOverTarget(null)}
                   onDrop={handleDrop}
                >
                   {primaryTags.map(tag => (
                     <div 
                       key={tag.id} 
                       className="tag-chip-light rounded-full flex items-center gap-1 cursor-grab active:cursor-grabbing" 
                       draggable 
                       onDragStart={(e) => handleDragStart(e, tag, 'primary')}
                     >
                       {tag.type}: {tag.name} 
                       <button 
                         onClick={() => removeTag(tag)} 
                         className="p-1 px-2 -mr-2 text-gray-500 hover:text-black focus:outline-none rounded-full hover:bg-gray-100 transition-colors"
                       >
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                         </svg>
                       </button>
                     </div>
                   ))}
                   {primaryTags.length === 0 && (
                     <span className="text-gray-400 text-sm mt-1">No tags selected (playlist generated strictly by vector)</span>
                   )}
                </div>
              </div>

              {/* Playlist Size Slider */}
              <div className="mt-2 px-1">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-sm font-bold uppercase text-gray-400">Playlist Size: {maxSongs}</span>
                 </div>
                 <input
                   type="range"
                   min="10"
                   max="50"
                   step="5"
                   value={maxSongs}
                   onChange={(e) => setMaxSongs(parseInt(e.target.value, 10))}
                   className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                 />
              </div>
           </div>

           {/* Right Column: Searchable Tags Pool */}
           <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Available Tags</h3>
              <div className="w-full flex-grow border-2 border-[#e5e5e5] rounded-3xl p-4 flex flex-col gap-3 max-h-[430px]">
                 
                 {/* Search Box */}
                 <div className="relative">
                   <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                   <input 
                     type="text" 
                     placeholder="Search for Genre, Artist, Language..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 border border-[#e5e5e5] rounded-full focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-colors"
                   />
                 </div>

                 {/* Tags Scroll List */}
                 <div className="flex flex-col mt-1 overflow-y-auto pr-2 custom-scrollbar">
                    {availableTags.map((tag) => (
                      <div 
                        key={tag.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0 hover:bg-red-50 rounded px-2 transition-colors gap-2 cursor-grab"
                        draggable
                        onDragStart={(e) => handleDragStart(e, tag, 'available')}
                      >
                        <span className="font-medium text-gray-700 truncate min-w-0">
                          {tag.type}: <span className="text-black">{tag.name}</span>
                        </span>
                        <button 
                          onClick={() => addTag(tag)}
                          className="px-4 py-1 bg-white border border-gray-200 hover:border-red-500 hover:text-red-500 rounded-full font-bold text-xs transition-colors flex-shrink-0"
                          title="Add Filter"
                        >
                          + ADD
                        </button>
                      </div>
                    ))}
                    {availableTags.length === 0 && (
                      <div className="text-center text-gray-400 py-6 text-sm">No tags match "{searchTerm}"</div>
                    )}
                 </div>
              </div>
           </div>

         </div>
      </div>
    </div>
  );
}
