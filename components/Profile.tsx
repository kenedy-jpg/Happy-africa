import React, { useState } from 'react';
import { User, Video } from '../types';
import { Menu, UserPlus, Grid, Lock, Heart, Bookmark, Play, ChevronDown, Coins, Edit3 } from 'lucide-react';

interface ProfileProps {
  user: User;
  videos: Video[];
  onOpenWallet: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, videos, onOpenWallet }) => {
  const userVideos = videos.filter(v => v.user.id === user.id);
  const displayVideos = userVideos.length > 0 ? userVideos : Array(6).fill(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'likes' | 'private'>('grid');

  return (
    <div className="w-full h-full overflow-y-auto bg-brand-indigo text-white pb-24">
      {/* Gradient Header Background */}
      <div className="w-full h-32 bg-gradient-to-br from-brand-pink via-brand-purple to-brand-indigo relative">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      {/* Header Nav */}
      <div className="fixed top-0 w-full md:w-[28rem] flex justify-between items-center px-4 py-3 z-30 text-white drop-shadow-md">
        <div className="w-8 h-8 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full cursor-pointer hover:bg-black/30">
           <UserPlus size={18} />
        </div>
        <div className="flex items-center gap-1 font-bold text-lg drop-shadow-md">
           {user.displayName} 
           <ChevronDown size={14} className="bg-white/20 rounded-full p-0.5" />
        </div>
        <div className="w-8 h-8 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full cursor-pointer hover:bg-black/30">
          <Menu size={18} />
        </div>
      </div>

      {/* User Info Container */}
      <div className="flex flex-col items-center -mt-12 px-4 relative z-10">
        <div className="relative mb-3 group">
          <div className="w-[104px] h-[104px] rounded-full bg-brand-indigo flex items-center justify-center">
            <img 
              src={user.avatarUrl} 
              alt="profile" 
              className="w-24 h-24 rounded-full border-4 border-brand-indigo object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="absolute bottom-2 right-2 bg-brand-pink p-1.5 rounded-full border-2 border-brand-indigo text-white shadow-lg">
             <PlusIconOrEdit />
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-1">@{user.username}</h2>
        
        {/* Wallet / Balance Button */}
        <button 
          onClick={onOpenWallet}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-5 active:scale-95 transition-transform hover:bg-white/10"
        >
           <Coins size={16} className="text-brand-gold fill-brand-gold" />
           <span className="font-bold text-sm text-brand-gold">{user.coins}</span>
           <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
           <span className="text-xs uppercase font-bold tracking-wide text-brand-pink">Recharge</span>
        </button>
        
        <div className="flex items-center gap-8 mb-6 text-center w-full justify-center">
          <div className="flex flex-col items-center">
            <span className="font-black text-xl">{user.following}</span>
            <span className="text-gray-400 text-xs font-medium">Following</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/10 px-8">
            <span className="font-black text-xl">{user.followers}</span>
            <span className="text-gray-400 text-xs font-medium">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-black text-xl">{user.likes}</span>
            <span className="text-gray-400 text-xs font-medium">Likes</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6 w-full justify-center px-4 max-w-sm">
           <button className="flex-1 py-3 bg-brand-pink text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-pink/20 hover:bg-brand-pink/90 transition flex items-center justify-center">
              Edit profile
           </button>
           <button className="px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition flex items-center justify-center border border-white/5">
              <Bookmark size={20} className="text-white/80" />
           </button>
        </div>

        <p className="text-sm text-center text-gray-200 whitespace-pre-line mb-4 px-4 leading-relaxed max-w-xs mx-auto">
           {user.bio || 'Add a bio to let people know who you are.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 sticky top-[0px] bg-brand-indigo/95 backdrop-blur-md z-20 h-12 mt-2">
         <button 
           onClick={() => setActiveTab('grid')}
           className={`flex-1 flex justify-center items-center cursor-pointer transition-colors relative ${activeTab === 'grid' ? 'text-white' : 'text-gray-500'}`}
         >
            <Grid size={20} />
            {activeTab === 'grid' && <div className="absolute bottom-0 w-12 h-[3px] bg-brand-pink rounded-t-full shadow-[0_-2px_10px_rgba(255,79,154,0.5)]"></div>}
         </button>
         <button 
           onClick={() => setActiveTab('private')}
           className={`flex-1 flex justify-center items-center cursor-pointer transition-colors relative ${activeTab === 'private' ? 'text-white' : 'text-gray-500'}`}
         >
            <Lock size={20} />
            {activeTab === 'private' && <div className="absolute bottom-0 w-12 h-[3px] bg-brand-pink rounded-t-full shadow-[0_-2px_10px_rgba(255,79,154,0.5)]"></div>}
         </button>
         <button 
           onClick={() => setActiveTab('likes')}
           className={`flex-1 flex justify-center items-center cursor-pointer transition-colors relative ${activeTab === 'likes' ? 'text-white' : 'text-gray-500'}`}
         >
            <Heart size={20} className={activeTab === 'likes' ? '' : 'stroke-gray-500'} />
            {activeTab === 'likes' && <div className="absolute bottom-0 w-12 h-[3px] bg-brand-pink rounded-t-full shadow-[0_-2px_10px_rgba(255,79,154,0.5)]"></div>}
         </button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-3 gap-[1px]">
         {activeTab === 'grid' && displayVideos.map((video, idx) => (
            <div key={idx} className="aspect-[3/4] bg-brand-dark relative group cursor-pointer overflow-hidden">
              {video ? (
                 <>
                   <video src={video.url} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                   <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[12px] font-bold drop-shadow-md">
                      <Play size={12} className="fill-white text-white" />
                      <span className="text-white">{video.likes * 12}</span>
                   </div>
                 </>
              ) : (
                 <div className="w-full h-full flex items-center justify-center bg-white/5">
                 </div>
              )}
            </div>
         ))}
         
         {activeTab !== 'grid' && (
           <div className="col-span-3 py-24 flex flex-col items-center justify-center text-gray-500 gap-4">
             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-2">
                <Lock size={32} className="opacity-50 text-brand-pink" />
             </div>
             <p className="text-sm font-medium">Content hidden</p>
           </div>
         )}
      </div>
    </div>
  );
};

const PlusIconOrEdit = () => (
    <Edit3 size={12} />
);