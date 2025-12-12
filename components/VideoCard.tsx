import React, { useRef, useState, useEffect } from 'react';
import { Video } from '../types';
import { Heart, MessageCircle, Share2, Music, Plus, Play, Gift, ExternalLink, Image } from 'lucide-react';
import { trackInteraction } from '../services/recommendationEngine';

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onOpenComments: () => void;
  onOpenShare: () => void;
  onOpenGift: () => void;
  onRequireAuth: (cb: () => void) => void;
  isLoggedIn: boolean;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  isActive, 
  onOpenComments, 
  onOpenShare, 
  onOpenGift,
  onRequireAuth,
  isLoggedIn
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [isFollowing, setIsFollowing] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const lastTapRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);

  // Slideshow State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slideInterval = useRef<number | null>(null);

  // Instrumentation State
  const startTimeRef = useRef<number>(0);
  const hasRecordedViewRef = useRef<boolean>(false);

  useEffect(() => {
    if (isActive) {
      // START TRACKING VIEW
      startTimeRef.current = Date.now();
      hasRecordedViewRef.current = false;
      trackInteraction(video, 'view_start');

      // Video Logic
      if (video.type !== 'slideshow') {
        const playPromise = videoRef.current?.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((error) => {
              setIsPlaying(false);
            });
        }
      } else {
        // Slideshow Logic
        setIsPlaying(true);
        if (video.images && video.images.length > 1) {
           slideInterval.current = window.setInterval(() => {
              setCurrentSlideIndex(prev => (prev + 1) % (video.images?.length || 1));
              // Progress bar for slideshow based on index
              const total = video.images?.length || 1;
              setProgress(((currentSlideIndex + 1) / total) * 100);
           }, 2500);
        }
      }

    } else {
      // STOP TRACKING & ANALYZE
      if (startTimeRef.current > 0) {
        const duration = Date.now() - startTimeRef.current;
        if (duration < 3000) {
          trackInteraction(video, 'skip');
        }
      }

      if (video.type !== 'slideshow') {
        videoRef.current?.pause();
        videoRef.current!.currentTime = 0;
      } else {
        if (slideInterval.current) clearInterval(slideInterval.current);
        setCurrentSlideIndex(0);
      }
      
      setIsPlaying(false);
      setFloatingHearts([]); 
    }
    
    return () => {
       if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, [isActive, video]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      const percent = (current / total) * 100;
      setProgress(percent);

      if (!hasRecordedViewRef.current && percent > 80) {
        hasRecordedViewRef.current = true;
        trackInteraction(video, 'view_complete');
      }
    }
  };

  const spawnHeart = (x: number, y: number) => {
    const newHeart: FloatingHeart = {
      id: Date.now(),
      x: x,
      y: y,
      rotation: Math.random() * 40 - 20, 
    };
    setFloatingHearts((prev) => [...prev, newHeart]);
    
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter(h => h.id !== newHeart.id));
    }, 1000);
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (video.isAd && video.adLink) {
       // Optional ad logic
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    let clientX, clientY;
    if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
    } else {
       clientX = (e as React.MouseEvent).clientX;
       clientY = (e as React.MouseEvent).clientY;
    }

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        spawnHeart(x, y);
        
        onRequireAuth(() => {
          if (!isLiked) {
            setIsLiked(true);
            setLikeCount(prev => prev + 1);
            trackInteraction(video, 'like'); 
          }
        });
      }
    } else {
      togglePlay();
    }
    lastTapRef.current = now;
  };

  const togglePlay = () => {
    if (video.type === 'slideshow') {
       setIsPlaying(!isPlaying);
       // In a real app this would pause the interval
       return;
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onRequireAuth(() => {
      if (isLiked) {
        setLikeCount(prev => prev - 1);
      } else {
        setLikeCount(prev => prev + 1);
        trackInteraction(video, 'like');
      }
      setIsLiked(!isLiked);
    });
  };
  
  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequireAuth(() => {
        setIsFollowing(true);
    });
  };

  const handleShare = (e: React.MouseEvent) => {
     e.stopPropagation();
     trackInteraction(video, 'share');
     onOpenShare();
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-brand-indigo snap-center snap-always flex items-center justify-center overflow-hidden border-b border-brand-dark select-none"
      onClick={handleContainerClick}
    >
      {/* RENDERER */}
      {video.type === 'slideshow' && video.images ? (
          <div className="w-full h-full relative bg-brand-indigo">
             {video.images.map((img, idx) => (
               <img 
                 key={idx}
                 src={img}
                 className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${idx === currentSlideIndex ? 'opacity-100' : 'opacity-0'}`}
               />
             ))}
             {/* Ken Burns Effect Overlay */}
             <div className={`absolute inset-0 bg-brand-indigo/10 pointer-events-none transition-transform duration-[3000ms] ease-linear ${currentSlideIndex % 2 === 0 ? 'scale-110' : 'scale-100'}`}></div>
             
             {/* Photo Badge */}
             <div className="absolute top-20 left-4 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                 <Image size={10} className="text-brand-pink" /> Photo Mode
             </div>
          </div>
      ) : (
          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-cover"
            loop
            playsInline
            poster={video.poster}
            onTimeUpdate={handleTimeUpdate}
          />
      )}

      {/* Floating Hearts (Z-index 30, below Nav) */}
      {floatingHearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute pointer-events-none animate-float-up z-30"
          style={{
            left: heart.x - 40, 
            top: heart.y - 40,
            '--rotate': `${heart.rotation}deg`,
          } as React.CSSProperties}
        >
          <Heart 
             size={80} 
             className="text-brand-pink fill-brand-pink drop-shadow-lg" 
             style={{ filter: 'drop-shadow(0px 5px 15px rgba(255,79,154,0.6))' }}
          />
        </div>
      ))}

      {/* Play Overlay Icon */}
      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-200 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
      >
        <Play className="w-16 h-16 text-white/50 fill-white drop-shadow-lg" />
      </div>

      {/* Progress Bar (Gold or Peach) */}
      <div className={`absolute bottom-0 left-0 w-full h-[3px] z-40 ${video.isAd ? 'bg-brand-gold/20' : 'bg-white/20'}`}>
        <div 
           className={`h-full transition-all duration-100 ease-linear ${video.isAd ? 'bg-gold-gradient' : 'bg-african-gradient'}`}
           style={{ width: `${progress}%` }}
        />
      </div>

      {/* RIGHT SIDEBAR ACTIONS */}
      <div className="absolute right-2 bottom-[90px] flex flex-col items-center gap-5 z-20 w-14 pb-safe">
        
        {/* Avatar */}
        <div className="relative mb-3">
          <div className="w-12 h-12 bg-white rounded-full p-[2px] transition-transform active:scale-90" onClick={(e) => e.stopPropagation()}>
            <img 
              src={video.user.avatarUrl} 
              alt={video.user.username} 
              className="w-full h-full rounded-full object-cover border-2 border-brand-gold"
            />
          </div>
          {!isFollowing && !video.isAd && (
            <div 
              onClick={handleFollow}
              className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-african-gradient rounded-full p-1 cursor-pointer transition-transform hover:scale-110 shadow-lg"
            >
              <Plus size={12} className="text-white" strokeWidth={4} />
            </div>
          )}
        </div>

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={`transition-transform duration-200 active:scale-75 ${isLiked ? 'animate-[bounce_0.5s]' : ''}`}>
            <Heart 
              size={36} 
              className={`${isLiked ? 'fill-brand-pink text-brand-pink' : 'fill-brand-gold text-brand-gold'}`} 
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
          <span className="text-xs font-semibold drop-shadow-md text-white">{likeCount}</span>
        </button>

        {/* Comment */}
        <button 
           className="flex flex-col items-center gap-1" 
           onClick={(e) => { e.stopPropagation(); onOpenComments(); }}
        >
          <div className="transition-transform active:scale-75">
            <MessageCircle 
              size={34} 
              className="fill-brand-gold text-brand-gold" 
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
          <span className="text-xs font-semibold drop-shadow-md text-white">{video.comments}</span>
        </button>

        {/* Gift */}
        {!video.isAd && (
          <button 
             className="flex flex-col items-center gap-1" 
             onClick={(e) => { 
               e.stopPropagation(); 
               onRequireAuth(onOpenGift); 
             }}
          >
            <div className="transition-transform active:scale-75">
              <Gift 
                size={34} 
                className="fill-brand-gold text-brand-gold"
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(255,215,0,0.5))' }}
              />
            </div>
            <span className="text-xs font-semibold drop-shadow-md text-white">Gift</span>
          </button>
        )}

        {/* Share */}
        <button 
           className="flex flex-col items-center gap-1" 
           onClick={handleShare}
        >
          <div className="transition-transform active:scale-75">
            <Share2 
              size={34} 
              className="fill-brand-gold text-brand-gold"
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
          <span className="text-xs font-semibold drop-shadow-md text-white">{video.shares}</span>
        </button>
        
        {/* Disc Animation */}
        <div className="mt-4 relative flex items-center justify-center">
           <div className={`w-12 h-12 bg-black/80 rounded-full border-[8px] border-black/80 flex items-center justify-center overflow-hidden ${isPlaying ? 'animate-spin-slow' : ''}`}>
             <img 
                src={video.user.avatarUrl} 
                className="w-7 h-7 rounded-full object-cover"
                alt="music"
             />
           </div>
           {isPlaying && (
              <div className="absolute -top-4 -right-4 flex flex-col gap-2">
                 <Music size={12} className="text-brand-pink animate-bounce delay-75 opacity-70" />
                 <Music size={10} className="text-brand-gold animate-bounce delay-150 opacity-60 -ml-2" />
              </div>
           )}
        </div>
      </div>

      {/* METADATA */}
      <div className="absolute bottom-[55px] left-0 w-[75%] pl-4 z-10 flex flex-col justify-end pb-safe mb-4 pointer-events-none">
        <div className="pointer-events-auto">
            <h3 className="font-bold text-lg drop-shadow-md mb-2 cursor-pointer hover:underline text-white flex items-center gap-2">
              @{video.user.username}
              {video.isAd && (
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold backdrop-blur-sm border border-white/30">
                  Sponsored
                </span>
              )}
            </h3>
            
            <div className="text-[15px] leading-tight drop-shadow-md text-white mb-3 line-clamp-2">
                <span className="mr-2">{video.description}</span>
                {video.hashtags.map((tag, i) => (
                <span key={i} className="font-bold text-white cursor-pointer hover:underline mr-1">
                    {tag}
                </span>
                ))}
            </div>
            
            {video.isAd && video.adLink && (
               <div className="mb-3 bg-brand-pink/90 text-white px-3 py-2 rounded w-fit flex items-center gap-2 cursor-pointer active:scale-95 transition-transform backdrop-blur-md">
                   <span className="font-bold text-sm">Shop Now</span>
                   <ExternalLink size={14} />
               </div>
            )}

            <div className="flex items-center gap-2 mb-2">
            <Music size={14} className="text-white" />
            <div className="overflow-hidden w-40 relative h-5">
                <div className="whitespace-nowrap absolute animate-marquee text-[14px] text-white">
                {video.musicTrack || 'Original Sound'} &nbsp;&nbsp; • &nbsp;&nbsp; {video.musicTrack || 'Original Sound'}
                </div>
            </div>
            </div>
        </div>
      </div>
      
      {/* Gradient Shade */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
    </div>
  );
};