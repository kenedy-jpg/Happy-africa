import React, { useState, useEffect, useRef } from 'react';
import { VideoCard } from './VideoCard';
import { Video, FeedType } from '../types';
import { getRecommendedFeed, fetchMoreContent } from '../services/recommendationEngine';

interface VideoFeedProps {
  onOpenComments: () => void;
  onOpenShare: () => void;
  onOpenGift: () => void;
  onRequireAuth: (cb: () => void) => void;
  isLoggedIn: boolean;
  type: FeedType; // 'following' | 'foryou'
  initialVideos?: Video[]; // Optional override
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ 
  onOpenComments, 
  onOpenShare, 
  onOpenGift,
  onRequireAuth,
  isLoggedIn,
  type,
  initialVideos
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videos, setVideos] = useState<Video[]>(initialVideos || []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initialize Feed based on Type (Algorithmic or Following)
  useEffect(() => {
    if (initialVideos) {
        setVideos(initialVideos);
        return;
    }
    const newFeed = getRecommendedFeed(type);
    setVideos(newFeed);
    // Reset Scroll
    if (containerRef.current) containerRef.current.scrollTo(0, 0);
  }, [type, initialVideos]);

  // 2. Intersection Observer for Active Video & Infinite Scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(container.children).indexOf(entry.target);
            if (index !== -1) {
              setActiveIndex(index);
              
              // Infinite Scroll Trigger (if near end)
              if (index >= videos.length - 2 && !isLoading && !initialVideos) {
                  loadMore();
              }
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6, 
      }
    );

    Array.from(container.children).forEach((child) => observer.observe(child as Element));

    return () => observer.disconnect();
  }, [videos, isLoading]);

  const loadMore = async () => {
      setIsLoading(true);
      // Pass the current feed type so we get the correct kind of content
      const moreVideos = await fetchMoreContent(type);
      setVideos(prev => [...prev, ...moreVideos]);
      setIsLoading(false);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-y-scroll snap-y-mandatory no-scrollbar bg-black"
    >
      {videos.map((video, index) => (
        <div key={`${video.id}-${index}`} className="w-full h-full snap-start snap-always">
          <VideoCard 
            video={video} 
            isActive={index === activeIndex} 
            onOpenComments={onOpenComments}
            onOpenShare={onOpenShare}
            onOpenGift={onOpenGift}
            onRequireAuth={onRequireAuth}
            isLoggedIn={isLoggedIn}
          />
        </div>
      ))}
      
      {isLoading && (
        <div className="w-full h-24 flex items-center justify-center snap-start">
             <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {!isLoading && (
         <div className="w-full h-24 flex items-center justify-center snap-start text-gray-500">
            <span className="text-sm">End of updates</span>
         </div>
      )}
    </div>
  );
};