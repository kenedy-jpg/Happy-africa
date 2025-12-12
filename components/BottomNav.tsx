import React from 'react';
import { Home, Compass, MessageSquare, User, Plus } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isTransparent?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, isTransparent = false }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'discover', icon: Compass, label: 'Discover' },
    { id: 'upload', icon: Plus, label: '', isPrimary: true },
    { id: 'inbox', icon: MessageSquare, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Accounts' },
  ];

  return (
    <div 
      className={`absolute bottom-0 left-0 w-full flex items-center justify-between px-2 z-50 text-[10px] font-medium pt-2 pb-2 pb-safe transition-all duration-300 ${
        isTransparent 
          ? 'bg-black/20 backdrop-blur-xl border-t border-white/10 text-white' 
          : 'bg-brand-indigo/90 backdrop-blur-xl border-t border-white/5 text-gray-400 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]'
      }`}
    >
      {navItems.map((item) => {
        if (item.isPrimary) {
           return (
             <button
               key={item.id}
               onClick={() => onTabChange(item.id as Tab)}
               className="w-[20%] flex items-center justify-center transform transition-transform active:scale-95 group"
             >
                {/* Custom Create Button: Enhanced African Sunset Gradient */}
                <div className="relative w-[52px] h-[36px] flex items-center justify-center transition-transform group-hover:scale-110">
                   {/* Glow Effect */}
                   <div className="absolute inset-0 bg-brand-pink blur-md opacity-40 rounded-xl"></div>
                   
                   {/* Background Layers for Depth */}
                   <div className="absolute left-0 top-0 w-full h-full bg-brand-gold rounded-xl transform -translate-x-[2px] opacity-90"></div>
                   <div className="absolute right-0 top-0 w-full h-full bg-brand-pink rounded-xl transform translate-x-[2px] opacity-90"></div>
                   
                   {/* Main Button Surface */}
                   <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-brand-pink via-brand-orange to-brand-gold rounded-xl flex items-center justify-center shadow-inner border border-white/20">
                      <Plus className="text-white drop-shadow-md" size={24} strokeWidth={3.5} />
                   </div>
                </div>
             </button>
           );
        }

        const isActive = activeTab === item.id;
        const inactiveColorClass = isTransparent ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-300';
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as Tab)}
            className={`w-[20%] flex flex-col items-center justify-center gap-1.5 transition-all duration-200 relative ${
              isActive ? 'text-white scale-105' : inactiveColorClass
            }`}
          >
            {/* Active Indicator Glow */}
            {isActive && (
               <div className="absolute -top-[12px] left-1/2 transform -translate-x-1/2 w-8 h-1 bg-brand-pink rounded-b-full shadow-[0_0_10px_#FF4F9A]"></div>
            )}

            <item.icon 
              size={26} 
              className={`${isActive ? 'text-white fill-white/10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold text-brand-pink drop-shadow-sm' : 'font-medium'}`}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};