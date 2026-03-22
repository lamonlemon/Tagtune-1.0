import React, { useState, useEffect, useMemo } from 'react';

export default function TagSelector({ initialTags, onGenerate, tagsData = { genres: [], artists: [], groups: [] } }) {
  const [primaryTags, setPrimaryTags] = useState([]);
  const [secondaryTags, setSecondaryTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxSongs, setMaxSongs] = useState(25);

  const removeTag = (tag, listType) => {
    if (listType === 'primary') setPrimaryTags(prev => prev.filter(t => t.id !== tag.id));
    if (listType === 'secondary') setSecondaryTags(prev => prev.filter(t => t.id !== tag.id));
  };

  const addTag = (tag, listType) => {
    if (listType === 'primary') setPrimaryTags(prev => [...prev, tag]);
    if (listType === 'secondary') setSecondaryTags(prev => [...prev, tag]);
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

  useEffect(() => {
    if (!allTags || allTags.length === 0) return;

    const initialSecondary = [];
    
    // Language & Type
    if (initialTags.language) initialSecondary.push({ id: `lang_${initialTags.language}`, name: initialTags.language, type: 'Language' });
    if (initialTags.is_cover !== undefined) {
      const typeName = initialTags.is_cover ? 'Cover' : 'Original';
      initialSecondary.push({ id: `type_${typeName}`, name: typeName, type: 'Type' });
    }

    // Genre
    if (initialTags.primary_genre_id) {
      const tag = allTags.find(t => t.data?.genre_id === initialTags.primary_genre_id && t.type === 'Primary Genre');
      if (tag) initialSecondary.push(tag);
    }
    if (initialTags.sub_genre_id) {
      const tag = allTags.find(t => t.data?.genre_id === initialTags.sub_genre_id && t.type === 'Sub Genre');
      if (tag) initialSecondary.push(tag);
    }
    if (initialTags.micro_genre_id) {
      const tag = allTags.find(t => t.data?.genre_id === initialTags.micro_genre_id && t.type === 'Micro Genre');
      if (tag) initialSecondary.push(tag);
    }

    // Artist
    if (initialTags.artist_id) {
      const tag = allTags.find(t => t.id === `artist_${initialTags.artist_id}`);
      if (tag) initialSecondary.push(tag);
    }

    // Group
    if (initialTags.group_id) {
      const tag = allTags.find(t => t.id === `group_${initialTags.group_id}`);
      if (tag) initialSecondary.push(tag);
    }

    // Feat & Prod
    if (initialTags.song_featuring?.length > 0) {
      initialTags.song_featuring.forEach(f => {
        const tag = allTags.find(t => t.id === `feat_${f.artist_id}`);
        if (tag) initialSecondary.push(tag);
      });
    }
    if (initialTags.song_producers?.length > 0) {
      initialTags.song_producers.forEach(p => {
        const tag = allTags.find(t => t.id === `prod_${p.artist_id}`);
        if (tag) initialSecondary.push(tag);
      });
    }

    setSecondaryTags(initialSecondary);
    setPrimaryTags([]);
  }, [initialTags, allTags]);

  const availableTags = useMemo(() => {
    let filtered = allTags.filter(tag => {
      const isSelected = primaryTags.find(t => t.id === tag.id) || secondaryTags.find(t => t.id === tag.id);
      if (isSelected) return false;
      if (searchTerm) {
        return tag.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               tag.type.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
    // Slice Top 50 for max performance when typing
    return filtered.slice(0, 50);
  }, [allTags, primaryTags, secondaryTags, searchTerm]);

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
      cover_filter: coverTags.length > 0 ? coverTags[0] : null, // only one makes sense
      artist_ids: artists,
      feat_artist_ids: feats,
      prod_artist_ids: prods,
      group_ids: groups,
    };
  };

  const handleNext = () => {
    const primaryInfo = mapTags(primaryTags);
    const secondaryInfo = mapTags(secondaryTags);

    onGenerate({
      primary_tags: primaryInfo,
      secondary_tags: secondaryInfo,
      count: maxSongs
    });
  };

  return (
    <div className="w-full flex justify-center pb-10">
      <div className="w-full max-w-5xl">
         {/* Top bar with button and slider */}
         <div className="flex flex-col sm:flex-row items-center justify-between mb-6 px-4 lg:px-0 gap-4">
           <div className="flex flex-col w-full sm:w-64">
             <div className="flex justify-between items-center mb-2">
               <span className="text-sm font-bold uppercase text-gray-500">Playlist Size: {maxSongs}</span>
             </div>
             <input
               type="range"
               min="10"
               max="50"
               step="5"
               value={maxSongs}
               onChange={(e) => setMaxSongs(parseInt(e.target.value))}
               className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
             />
           </div>
           
           <button onClick={handleNext} className="btn-primary w-full sm:w-32 h-12 py-2 text-sm z-50">
             GENERATE {maxSongs} SONGS
           </button>
         </div>

         <div className="flex flex-col lg:flex-row gap-6 px-4 lg:px-0">
           {/* Left Column */}
           <div className="flex-1 flex flex-col gap-4">
              
              <div>
                <h3 className="text-xl font-bold mb-2">Primary tag</h3>
                <div className="w-full min-h-[150px] bg-[#e5e5e5] rounded-3xl p-4 flex flex-wrap gap-2 items-start content-start">
                   {primaryTags.map(tag => (
                     <div key={`primary-${tag.id}`} className="tag-chip-light flex items-center gap-1 shadow-sm">
                       {tag.type}: {tag.name} 
                       <button onClick={() => removeTag(tag, 'primary')} className="p-1 px-2 -mr-2 text-gray-500 hover:text-black focus:outline-none rounded-full hover:bg-gray-100 transition-colors">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                       </button>
                     </div>
                   ))}
                   {primaryTags.length === 0 && <span className="text-gray-400 text-sm mt-1">No primary tags selected</span>}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Secondary tag</h3>
                <div className="w-full min-h-[150px] bg-[#e5e5e5] rounded-3xl p-4 flex flex-wrap gap-2 items-start content-start">
                  {secondaryTags.map(tag => (
                     <div key={`secondary-${tag.id}`} className="tag-chip-light flex items-center gap-1 shadow-sm">
                       {tag.type}: {tag.name} 
                       <button onClick={() => removeTag(tag, 'secondary')} className="p-1 px-2 -mr-2 text-gray-500 hover:text-black focus:outline-none rounded-full hover:bg-gray-100 transition-colors">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                       </button>
                     </div>
                   ))}
                   {secondaryTags.length === 0 && <span className="text-gray-400 text-sm mt-1">No secondary tags selected</span>}
                </div>
              </div>
           </div>

           {/* Right Column */}
           <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Tags</h3>
              <div className="w-full flex-grow border-2 border-[#e5e5e5] rounded-xl p-4 flex flex-col gap-3 max-h-[430px]">
                 
                 {/* Search */}
                 <div className="relative">
                   <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                   <input 
                     type="text" 
                     placeholder="Search for Genre, Language..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 border border-[#e5e5e5] rounded-full focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-colors"
                   />
                 </div>

                 {/* Tags List */}
                 <div className="flex flex-col mt-1 overflow-y-auto pr-2 custom-scrollbar">
                    {availableTags.map((tag) => (
                      <div key={`avail-${tag.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0 hover:bg-red-50 rounded px-2 transition-colors gap-2">
                        <span className="font-medium text-gray-700 truncate min-w-0">{tag.type}: <span className="text-black">{tag.name}</span></span>
                        <div className="flex items-center bg-white rounded-full border border-gray-200 flex-shrink-0">
                          <button 
                            onClick={() => addTag(tag, 'primary')}
                            className="px-3 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-l-full font-bold text-xs border-r border-gray-200 transition-colors"
                            title="Add to Primary"
                          >
                            +<span className="text-[0.5em] translate-y-1">1</span>
                          </button>
                          <button 
                            onClick={() => addTag(tag, 'secondary')}
                            className="px-3 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-r-full font-bold text-xs transition-colors"
                            title="Add to Secondary"
                          >
                            +<span className="text-[0.5em] translate-y-1">2</span>
                          </button>
                        </div>
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
