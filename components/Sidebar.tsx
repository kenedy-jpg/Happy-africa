import React from 'react';
import { Home, Users, Compass, Video } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="hidden md:flex flex-col w-64 border-r border-white/5 h-full p-4 overflow-y-auto bg-brand-indigo">
      {/* Brand Logo with Gradient Text */}
      <h1 className="text-2xl font-black mb-8 flex items-center gap-2 tracking-tight">
         <span className="text-3xl animate-bounce">🌍</span> 
         <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-pink via-brand-orange to-brand-gold">
            Happy Africa
         </span>
      </h1>

      <div className="flex flex-col gap-2 mb-8">
        <button className="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-brand-pink font-bold border border-brand-pink/20 shadow-lg shadow-brand-pink/5 transition-all hover:scale-[1.02]">
           <Home size={24} />
           For You
        </button>
        <button className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-white/90 font-semibold transition-colors">
           <Users size={24} className="text-brand-peach" />
           Following
        </button>
        <button className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-white/90 font-semibold transition-colors">
           <Compass size={24} className="text-brand-gold" />
           Explore
        </button>
        <button className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-white/90 font-semibold transition-colors">
           <Video size={24} className="text-brand-green" />
           LIVE
        </button>
      </div>

      <div className="border-t border-white/5 pt-6">
        <p className="text-xs font-bold text-gray-500 mb-4 tracking-wider">SUGGESTED ACCOUNTS</p>
        <div className="flex flex-col gap-3">
           {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all group">
                 <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-brand-gold to-brand-pink">
                    <div className="w-full h-full rounded-full bg-brand-indigo border border-brand-indigo overflow-hidden">
                       <img src={`https://picsum.photos/100/100?random=${i}`} className="w-full h-full object-cover" />
                    </div>
                 </div>
                 <div>
                    <p className="text-sm font-bold text-white group-hover:text-brand-peach transition-colors">user_africa_{i}</p>
                    <p className="text-xs text-gray-400">Happy Creator</p>
                 </div>
              </div>
           ))}
        </div>
      </div>
      
      <div className="mt-auto pt-8 border-t border-white/5 text-xs text-gray-600">
         <div className="flex flex-wrap gap-2 mb-2">
            <span className="hover:underline cursor-pointer">About</span>
            <span className="hover:underline cursor-pointer">Newsroom</span>
            <span className="hover:underline cursor-pointer">Contact</span>
            <span className="hover:underline cursor-pointer">Careers</span>
         </div>
         <p>© 2025 Happy Africa</p>
         <p>Modern African Pop Theme</p>
      </div>
    </div>
  );
};