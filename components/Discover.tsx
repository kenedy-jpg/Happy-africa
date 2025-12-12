import React, { useState, useEffect, useRef } from 'react';
import { Search, Hash, Music, TrendingUp, Video as VideoIcon, Play, Pause } from 'lucide-react';
import { Video } from '../types';
import { getTrendingFeed, searchVideos } from '../services/recommendationEngine';
import { getTrendingMusic, TrendingSong } from '../services/geminiService';

interface DiscoverProps {
  onVideoClick: (video: Video) => void;
}

export const Discover: React.FC<DiscoverProps> = ({ onVideoClick }) => {
  const [query, setQuery] = useState('');
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [results, setResults] = useState<Video[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Real Trending Music State
  const [trendingSounds, setTrendingSounds] = useState<TrendingSong[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setTrendingVideos(getTrendingFeed());
    
    // Fetch Real Music
    getTrendingMusic().then(songs => {
       setTrendingSounds(songs.slice(0, 5)); // Take top 5
    });

    return () => {
       if (audioRef.current) {
          audioRef.current.pause();
       }
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 0) {
      setIsSearching(true);
      setResults(searchVideos(val));
    } else {
      setIsSearching(false);
    }
  };

  const handlePlayPreview = (track: TrendingSong, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (playingTrackId === track.id) {
       // Pause
       audioRef.current?.pause();
       setPlayingTrackId(null);
    } else {
       // Play new
       if (audioRef.current) {
          audioRef.current.pause();
       }
       
       if (track.audioUrl) {
          audioRef.current = new Audio(track.audioUrl);
          audioRef.current.volume = 0.6;
          audioRef.current.play().catch(err => console.error("Playback failed", err));
          audioRef.current.onended = () => setPlayingTrackId(null);
          setPlayingTrackId(track.id);
       }
    }
  };

  const banners = [
    { id: 1, title: '#HappyAfrica', subtitle: 'Share your joy', color: 'bg-african-gradient' },
    { id: 2, title: '#Ammapiano', subtitle: 'Dance to the beat', color: 'bg-pop-gradient' },
    { id: 3, title: '#SafariVibes', subtitle: 'Wild beauty', color: 'bg-gradient-to-br from-brand-green to-brand-gold' },
  ];

  const chips = [
    { label: 'Dance', emoji: '💃' },
    { label: 'Comedy', emoji: '😂' },
    { label: 'Food', emoji: '🍛' },
    { label: 'Sports', emoji: '⚽' },
    { label: 'Music', emoji: '🎵' },
    { label: 'Travel', emoji: '✈️' },
  ];

  return (
    <div className="w-full h-full bg-brand-indigo text-white flex flex-col pt-safe pb-24 overflow-y-auto">
      
      {/* Search Bar */}
      <div className="sticky top-0 bg-brand-indigo z-20 px-4 py-3 flex items-center gap-3 border-b border-white/5">
         <div className="flex-1 bg-white/10 rounded-xl flex items-center px-3 py-2.5 gap-2 transition-all focus-within:bg-white/15 border border-white/5">
             <Search size={18} className="text-gray-300" />
             <input 
               className="bg-transparent w-full text-sm outline-none placeholder-gray-400" 
               placeholder="Search Happy Africa..."
               value={query}
               onChange={handleSearch}
             />
         </div>
         {isSearching && (
           <button onClick={() => { setQuery(''); setIsSearching(false); }} className="text-sm font-bold text-brand-pink">Cancel</button>
         )}
      </div>

      {/* Search Results */}
      {isSearching ? (
        <div className="p-4 grid grid-cols-2 gap-2">
           {results.length === 0 ? (
             <div className="col-span-2 text-center text-gray-500 mt-10">No results found for "{query}"</div>
           ) : (
             results.map(video => (
               <div key={video.id} onClick={() => onVideoClick(video)} className="relative aspect-[3/4] bg-brand-dark rounded-xl overflow-hidden">
                  <video src={video.url} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 text-xs font-bold drop-shadow-md flex items-center gap-1">
                     <span>❤️ {video.likes}</span>
                  </div>
               </div>
             ))
           )}
        </div>
      ) : (
        <>
          {/* Quick Chips */}
          <div className="flex gap-2 overflow-x-auto px-4 py-4 no-scrollbar">
             {chips.map((chip, i) => (
                <div key={i} className="flex items-center gap-1 bg-white/5 border border-white/10 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer">
                   <span>{chip.emoji}</span>
                   <span>{chip.label}</span>
                </div>
             ))}
          </div>

          {/* Trending Banners (Carousel) */}
          <div className="mb-8">
            <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar snap-x">
               {banners.map(banner => (
                 <div key={banner.id} className={`snap-center min-w-[280px] h-40 rounded-2xl ${banner.color} p-5 flex flex-col justify-end shadow-lg shadow-black/30 relative overflow-hidden group cursor-pointer`}>
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                       <Hash size={90} className="text-white" />
                    </div>
                    <h3 className="font-black text-2xl drop-shadow-md">{banner.title}</h3>
                    <p className="text-sm font-medium opacity-90 drop-shadow-md">{banner.subtitle}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Music Trends (MOVED UP) */}
          <div className="px-4 mb-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                   <Music size={20} className="text-brand-peach" /> Trending Sounds
                </h3>
             </div>
             <div className="flex flex-col gap-3">
                {trendingSounds.length === 0 ? (
                   // Loading Skeleton
                   [1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>)
                ) : (
                   trendingSounds.map((track, i) => (
                     <div 
                        key={track.id || i} 
                        onClick={(e) => handlePlayPreview(track, e)}
                        className={`flex items-center gap-3 bg-white/5 p-3 rounded-xl border transition-all cursor-pointer group ${playingTrackId === track.id ? 'border-brand-pink bg-white/10' : 'border-white/5 hover:bg-white/10'}`}
                     >
                        <div className="w-10 h-10 bg-brand-indigo rounded-lg flex items-center justify-center font-bold text-gray-400 border border-white/10 relative overflow-hidden shrink-0">
                           {/* Deterministic placeholder cover */}
                           <img src={`https://picsum.photos/seed/${track.artist.replace(/\s/g,'')}/100/100`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                           
                           {/* Playing Indicator Overlay */}
                           {playingTrackId === track.id ? (
                               <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                   <div className="flex gap-0.5 h-3 items-end">
                                      <div className="w-1 bg-brand-pink animate-pulse h-full"></div>
                                      <div className="w-1 bg-brand-pink animate-pulse h-2"></div>
                                      <div className="w-1 bg-brand-pink animate-pulse h-3"></div>
                                   </div>
                               </div>
                           ) : (
                               <span className="absolute text-white font-bold shadow-black drop-shadow-md group-hover:hidden">{i + 1}</span>
                           )}
                           
                           {/* Play Icon on Hover */}
                           {playingTrackId !== track.id && (
                              <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center">
                                 <Play size={16} className="text-white fill-white" />
                              </div>
                           )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           <p className={`font-bold text-sm line-clamp-1 ${playingTrackId === track.id ? 'text-brand-pink' : 'text-white'}`}>{track.title}</p>
                           <p className="text-xs text-gray-400 truncate">{track.artist} • {track.genre || 'Viral'}</p>
                        </div>
                        
                        <button 
                            className={`w-8 h-8 border-2 rounded-full flex items-center justify-center transition-colors shrink-0 ${playingTrackId === track.id ? 'border-brand-pink text-white bg-brand-pink' : 'border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white'}`}
                        >
                           {playingTrackId === track.id ? (
                              <Pause size={14} fill="currentColor" />
                           ) : (
                              <Play size={14} fill="currentColor" className="ml-0.5" />
                           )}
                        </button>
                     </div>
                   ))
                )}
             </div>
          </div>

          {/* Trending Lists */}
          <div className="px-4 mb-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                   <TrendingUp size={20} className="text-brand-pink" /> Trending Videos
                </h3>
                <span className="text-xs text-brand-gold font-bold bg-white/5 px-2 py-1 rounded-md border border-white/5 cursor-pointer hover:bg-white/10">See all</span>
             </div>
             <div className="grid grid-cols-2 gap-2">
                {trendingVideos.slice(0, 4).map(video => (
                  <div key={video.id} onClick={() => onVideoClick(video)} className="relative aspect-[3/4] bg-brand-dark rounded-xl overflow-hidden cursor-pointer group">
                      <video src={video.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                      <div className="absolute bottom-3 left-3 right-3">
                         <p className="text-xs font-bold line-clamp-1 mb-1 text-white">{video.description}</p>
                         <div className="flex items-center gap-1 text-[10px] text-gray-300">
                            <img src={video.user.avatarUrl} className="w-4 h-4 rounded-full border border-white/20" />
                            <span className="truncate font-medium">@{video.user.username}</span>
                         </div>
                      </div>
                  </div>
                ))}
             </div>
          </div>

        </>
      )}
    </div>
  );
};