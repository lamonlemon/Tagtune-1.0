import React, { useState, useEffect, useMemo } from 'react';

export default function TagSelector({ initialTags, onGenerate, tagsData = { genres: [], artists: [], groups: [] } }) {
  const [primaryTags, setPrimaryTags] = useState([]);
  const [secondaryTags, setSecondaryTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const initialPrimary = [];
    if (initialTags.language) initialPrimary.push({ id: `lang_${initialTags.language}`, name: initialTags.language, type: 'Language' });
    if (initialTags.is_cover !== undefined) {
      const typeName = initialTags.is_cover ? 'Cover' : 'Original';
      initialPrimary.push({ id: `type_${typeName}`, name: typeName, type: 'Type' });
    }
    setPrimaryTags(initialPrimary);
    // Note: We leave genre initialization out for MVP simplicity to avoid complex ID matching, user will manually add if they want to override seeds.
  }, [initialTags]);

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

  const handleNext = () => {
    const allSelected = [...primaryTags, ...secondaryTags];
    const genreTag = allSelected.find(t => t.type.includes('Genre'));
    const langTag = allSelected.find(t => t.type === 'Language');
    const coverTag = allSelected.find(t => t.type === 'Type');
    
    const artistTag = allSelected.find(t => t.type === 'Artist');
    const featTag = allSelected.find(t => t.type === 'Featuring');
    const prodTag = allSelected.find(t => t.type === 'Producer');
    const groupTag = allSelected.find(t => t.type === 'Group');

    onGenerate({
      primary_genre_id: genreTag ? genreTag.data.genre_id : (initialTags.primary_genre_id || null),
      sub_genre_id: null,
      language: langTag ? langTag.name : (initialTags.language || null),
      cover_filter: coverTag ? coverTag.name.toLowerCase() : 'both',
      
      artist_id: artistTag ? artistTag.data.artist_id : null,
      feat_artist_id: featTag ? featTag.data.artist_id : null,
      prod_artist_id: prodTag ? prodTag.data.artist_id : null,
      group_id: groupTag ? groupTag.data.group_id : null,
      
      count: 20
    });
  };

  return (
    <div className="w-full flex justify-center pb-10">
      <div className="w-full max-w-5xl">
         {/* Top bar with button */}
         <div className="flex justify-end mb-4 pl-4 lg:pl-0">
           <button onClick={handleNext} className="btn-primary w-32 shadow-sm py-2 text-sm z-50">NEXT</button>
         </div>

         <div className="flex flex-col lg:flex-row gap-6 px-4 lg:px-0">
           {/* Left Column */}
           <div className="flex-1 flex flex-col gap-4">
              
              <div>
                <h3 className="text-lg font-bold mb-2">Primary tag</h3>
                <div className="w-full min-h-[80px] bg-[#e5e5e5] rounded-xl p-4 flex flex-wrap gap-2 items-start content-start shadow-inner">
                   {primaryTags.map(tag => (
                     <div key={`primary-${tag.id}`} className="tag-chip-light flex items-center gap-1 shadow-sm">
                       {tag.type}: {tag.name} 
                       <button onClick={() => removeTag(tag, 'primary')} className="p-1 px-2 -mr-2 text-gray-500 hover:text-black focus:outline-none rounded-full hover:bg-gray-100 transition-colors">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                       </button>
                     </div>
                   ))}
                   {primaryTags.length === 0 && <span className="text-gray-400 italic text-sm mt-1">No primary tags selected</span>}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">Secondary tag</h3>
                <div className="w-full min-h-[80px] bg-[#e5e5e5] rounded-xl p-4 flex flex-wrap gap-2 items-start content-start shadow-inner">
                  {secondaryTags.map(tag => (
                     <div key={`secondary-${tag.id}`} className="tag-chip-light flex items-center gap-1 shadow-sm">
                       {tag.type}: {tag.name} 
                       <button onClick={() => removeTag(tag, 'secondary')} className="p-1 px-2 -mr-2 text-gray-500 hover:text-black focus:outline-none rounded-full hover:bg-gray-100 transition-colors">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                       </button>
                     </div>
                   ))}
                   {secondaryTags.length === 0 && <span className="text-gray-400 italic text-sm mt-1">No secondary tags selected</span>}
                </div>
              </div>
           </div>

           {/* Right Column */}
           <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-bold mb-2">Tags</h3>
              <div className="w-full flex-grow border-2 border-[#e5e5e5] rounded-xl p-4 flex flex-col gap-3 max-h-[400px]">
                 
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
                        <div className="flex items-center gap-1 bg-white rounded-full shadow-sm border border-gray-200 flex-shrink-0">
                          <button 
                            onClick={() => addTag(tag, 'primary')}
                            className="px-3 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-l-full font-bold text-xs border-r border-gray-200 transition-colors"
                            title="Add to Primary"
                          >
                            +<span className="opacity-0 w-0 inline-block text-[0px]">1</span>
                          </button>
                          <button 
                            onClick={() => addTag(tag, 'secondary')}
                            className="px-3 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-r-full font-bold text-xs transition-colors"
                            title="Add to Secondary"
                          >
                            +_2
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
