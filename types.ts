
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  followers: number;
  following: number;
  likes: number;
  bio?: string;
  coins: number; // Virtual currency balance
  isLive?: boolean; // New field
}

export interface Comment {
  id: string | number;
  username: string;
  text: string;
  createdAt: string;
  likes: number;
  avatarUrl?: string; // Optional for mock data
  isGift?: boolean;
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  price: number;
}

export interface Video {
  id: string;
  url?: string; // Optional for slideshows
  images?: string[]; // For slideshows
  type?: 'video' | 'slideshow';
  poster: string;
  description: string;
  hashtags: string[];
  likes: number;
  comments: number;
  shares: number;
  user: User;
  musicTrack?: string;
  // New fields for Algorithm & Ads
  category: 'dance' | 'comedy' | 'travel' | 'tech' | 'food' | 'ad'; 
  isAd?: boolean;
  adLink?: string;
}

export type Tab = 'home' | 'discover' | 'upload' | 'inbox' | 'profile' | 'live';
export type FeedType = 'following' | 'foryou';

// --- LIVE STREAMING TYPES ---

export interface LiveComment {
  id: string;
  username: string;
  avatarUrl: string;
  text: string;
  isSystem?: boolean; // e.g., "joined the live"
}

export interface LiveStream {
  id: string;
  host: User;
  title: string;
  viewers: number;
  likes: number;
  thumbnail: string;
  streamUrl?: string; // For mock viewer
}

export interface LiveStats {
  duration: string;
  totalViewers: number;
  newFollowers: number;
  diamondsEarned: number; // Converted from gifts
}
