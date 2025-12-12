import { Video, User, FeedType } from '../types';
import { MOCK_VIDEOS } from '../constants';

// 1. User Affinity Profile (The "Black Box" Data)
// Tracks how much a user likes specific categories (0 to 1 score)
interface UserInterestProfile {
  [category: string]: number;
}

// Initial Profile (Cold Start: Generic interest)
let userProfile: UserInterestProfile = {
  dance: 0.1,
  comedy: 0.1,
  travel: 0.1,
  tech: 0.1,
  food: 0.1,
  ad: 0, // Should not boost ads naturally
};

// MUTABLE VIDEO DATABASE
// We initialize this with mock data, but allow new videos to be added at runtime.
let videoDatabase: Video[] = [...MOCK_VIDEOS];

export const injectVideo = (video: Video) => {
  // Add new video to the beginning of the database
  videoDatabase.unshift(video);
  console.log(`[Algorithm] Video injected: ${video.id}`);
};

// 2. Event Instrumentation (Collecting signals)
export type InteractionType = 'view_start' | 'view_complete' | 'like' | 'share' | 'skip';

export const trackInteraction = (video: Video, type: InteractionType) => {
  const category = video.category;
  if (!category || category === 'ad') return;

  // The "Real-time Feedback Loop"
  // Updates user profile immediately based on action
  switch (type) {
    case 'like':
      userProfile[category] = (userProfile[category] || 0) + 0.5; // Strong signal
      break;
    case 'share':
      userProfile[category] = (userProfile[category] || 0) + 0.8; // Very strong signal
      break;
    case 'view_complete':
      userProfile[category] = (userProfile[category] || 0) + 0.2; // Moderate signal
      break;
    case 'skip':
      // Negative reinforcement (Video watched less than 3s)
      userProfile[category] = Math.max(0, (userProfile[category] || 0) - 0.1); 
      break;
  }

  console.log(`[Algorithm] Updated Profile for ${category}:`, userProfile[category].toFixed(2));
};

// 3. Ranking & Scoring Engine
const scoreVideo = (video: Video): number => {
  if (video.isAd) return -1; // Ads are inserted manually, not ranked

  const categoryScore = userProfile[video.category] || 0;
  const popularityScore = video.likes / 100000; // Normalized popularity
  const randomNoise = Math.random() * 0.2; // Exploration (Novelty)

  // Formula: (Personal Interest * 0.7) + (Popularity * 0.2) + (Noise * 0.1)
  return (categoryScore * 0.7) + (popularityScore * 0.2) + randomNoise;
};

// 4. Feed Generation Service
export const getRecommendedFeed = (type: FeedType, offset: number = 0): Video[] => {
  console.log(`[Algorithm] Generating ${type} feed from ${videoDatabase.length} videos...`);

  // Step A: Candidate Generation
  let candidates = [...videoDatabase];
  
  if (type === 'following') {
    // Simple filter for following
    // In a real app, check if CURRENT_USER follows video.user.id
    // Here we just mock it by returning a subset
    return candidates.filter(v => !v.isAd && v.user.id !== 'brand_coke').slice(0, 5);
  }

  // Step B: Ranking (For You Page)
  // Sort candidates by the predicted score
  // We keep the newest uploads near the top for visibility in this demo
  candidates.sort((a, b) => {
      // If it's a new user upload (id starts with 'v' and is long number), boost it
      const isNewA = a.id.length > 5; 
      const isNewB = b.id.length > 5;
      if (isNewA && !isNewB) return -1;
      if (!isNewA && isNewB) return 1;
      
      return scoreVideo(b) - scoreVideo(a);
  });

  // Step C: Ad Injection
  // Inject an ad every 5 videos
  const feed: Video[] = [];
  let videoCount = 0;

  const adVideo = videoDatabase.find(v => v.isAd);

  candidates.forEach(video => {
    if (video.isAd) return; // Skip ads in pool, we inject them specifically
    
    feed.push(video);
    videoCount++;

    if (videoCount % 4 === 0 && adVideo) {
      feed.push({...adVideo, id: `ad_${Date.now()}_${videoCount}`}); // Unique ID for key
    }
  });

  return feed;
};

// Helper to simulate "More content loading" with Real-Time Ranking
export const fetchMoreContent = async (type: FeedType): Promise<Video[]> => {
    console.log(`[Algorithm] Fetching more ${type} content with updated profile:`, userProfile);

    return new Promise((resolve) => {
        setTimeout(() => {
            // 1. Candidate Generation
            let candidates = [...videoDatabase].filter(v => !v.isAd);

            if (type === 'following') {
               const following = candidates.filter(v => v.user.id !== 'brand_coke'); // Simulate following list
               resolve(following.sort(() => 0.5 - Math.random()).slice(0, 2));
               return;
            }

            // 2. Re-Ranking (The Feedback Loop)
            // We re-sort the candidates based on the *latest* userProfile values.
            candidates.sort((a, b) => scoreVideo(b) - scoreVideo(a));

            // 3. Selection (Top picks + Exploration)
            // Take top 2 ranked videos
            const topPicks = candidates.slice(0, 2);
            // Add 1 random video for diversity (Exploration)
            const randomPick = candidates[Math.floor(Math.random() * candidates.length)];
            
            // Assign new IDs so React renders them as new items
            const newBatch = [...topPicks, randomPick].map(v => ({
                ...v, 
                id: `${v.id}_${Date.now()}_${Math.random()}`
            }));

            resolve(newBatch);
        }, 1000);
    });
};

// New: Get Trending Feed (Sorted by raw popularity)
export const getTrendingFeed = (): Video[] => {
  return [...videoDatabase]
    .filter(v => !v.isAd)
    .sort((a, b) => {
       // Weighted popularity score
       const scoreA = a.likes + (a.comments * 2) + (a.shares * 5);
       const scoreB = b.likes + (b.comments * 2) + (b.shares * 5);
       return scoreB - scoreA;
    });
};

// New: Search Videos (Simple Indexing Simulation)
export const searchVideos = (query: string): Video[] => {
  const q = query.toLowerCase();
  return videoDatabase.filter(v => 
    v.description.toLowerCase().includes(q) || 
    v.hashtags.some(tag => tag.toLowerCase().includes(q)) ||
    v.user.username.toLowerCase().includes(q)
  );
};