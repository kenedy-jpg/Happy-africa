import { Video, User } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  username: 'happy_user',
  displayName: 'Happy Creator',
  avatarUrl: 'https://picsum.photos/100/100',
  followers: 1205,
  following: 45,
  likes: 8500,
  coins: 1500, 
  bio: 'Sharing the joy of Africa! 🌍✨'
};

const MOCK_USERS = [
  { id: 'u2', username: 'travel_king', displayName: 'Travel King', avatarUrl: 'https://picsum.photos/100/100?random=2', followers: 5000, following: 100, likes: 20000, coins: 0 },
  { id: 'u3', username: 'artistic_soul', displayName: 'Artistic Soul', avatarUrl: 'https://picsum.photos/100/100?random=4', followers: 8900, following: 20, likes: 45000, coins: 0 },
  { id: 'u4', username: 'tech_guru', displayName: 'Tech Guru', avatarUrl: 'https://picsum.photos/100/100?random=6', followers: 1200, following: 300, likes: 5000, coins: 0 },
  { id: 'u5', username: 'chef_mama', displayName: 'Mama Africa Kitchen', avatarUrl: 'https://picsum.photos/100/100?random=8', followers: 15000, following: 10, likes: 90000, coins: 0 },
  { id: 'u6', username: 'dance_crew_ke', displayName: 'Nairobi Dancers', avatarUrl: 'https://picsum.photos/100/100?random=9', followers: 32000, following: 50, likes: 120000, coins: 0 },
  { id: 'brand_coke', username: 'cocacola_africa', displayName: 'Coca-Cola Africa', avatarUrl: 'https://ui-avatars.com/api/?name=Coke&background=red&color=fff', followers: 100000, following: 0, likes: 5000, coins: 0 },
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'v1',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    poster: 'https://picsum.photos/400/800?random=1',
    description: 'Cruising through the city! #vibes #travel',
    hashtags: ['#vibes', '#travel', '#africa'],
    likes: 1200,
    comments: 45,
    shares: 12,
    user: MOCK_USERS[0],
    musicTrack: 'Original Sound - Travel King',
    category: 'travel'
  },
  {
    id: 'v2',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    poster: 'https://picsum.photos/400/800?random=3',
    description: 'Animation magic ✨ #art #creative',
    hashtags: ['#art', '#creative', '#animation'],
    likes: 3400,
    comments: 120,
    shares: 300,
    user: MOCK_USERS[1],
    musicTrack: 'Dreamy Beats - LoFi',
    category: 'tech'
  },
  {
    id: 'v3',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    poster: 'https://picsum.photos/400/800?random=5',
    description: 'Tech is the future 🚀 #scifi #tech',
    hashtags: ['#scifi', '#tech', '#future'],
    likes: 890,
    comments: 22,
    shares: 5,
    user: MOCK_USERS[2],
    musicTrack: 'Cyberpunk Theme',
    category: 'tech'
  },
  {
    id: 'v4',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://picsum.photos/400/800?random=7',
    description: 'Cooking Jollof Rice today! 🍛 #food #africa',
    hashtags: ['#food', '#jollof', '#cooking'],
    likes: 5600,
    comments: 300,
    shares: 150,
    user: MOCK_USERS[3],
    musicTrack: 'Afrobeats Cooking Mix',
    category: 'food'
  },
  {
    id: 'v5',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://picsum.photos/400/800?random=11',
    description: 'New dance challenge! Can you do it? 💃 #dance',
    hashtags: ['#dance', '#challenge', '#trending'],
    likes: 15000,
    comments: 800,
    shares: 2000,
    user: MOCK_USERS[4],
    musicTrack: 'Amapiano Hit 2025',
    category: 'dance'
  },
  // ADVERTISEMENT
  {
    id: 'ad1',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://picsum.photos/400/800?random=99',
    description: 'Taste the feeling. Refresh yourself today. #ad',
    hashtags: ['#refresh', '#ad', '#sponsored'],
    likes: 500,
    comments: 0,
    shares: 0,
    user: MOCK_USERS[5],
    musicTrack: 'Commercial Sound',
    category: 'ad',
    isAd: true,
    adLink: 'https://www.coca-cola.com'
  }
];