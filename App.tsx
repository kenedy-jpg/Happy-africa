import React, { useState, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { VideoFeed } from './components/VideoFeed';
import { Profile } from './components/Profile';
import { Upload } from './components/Upload';
import { Sidebar } from './components/Sidebar';
import { Auth } from './components/Auth';
import { GiftPicker } from './components/GiftPicker';
import { Wallet } from './components/Wallet';
import { CommentsSheet } from './components/CommentsSheet';
import { Discover } from './components/Discover';
import { SplashScreen } from './components/SplashScreen';
import { LiveViewer } from './components/LiveViewer'; // Import LiveViewer
import { MOCK_VIDEOS, CURRENT_USER } from './constants';
import { Tab, Video, Comment, FeedType, User } from './types';
import { Search, Tv, X, Flag, Link, Copy, MessageCircle, UserPlus, Users, Plus, Heart } from 'lucide-react';
import { injectVideo } from './services/recommendationEngine';

// --- Mock Data ---
const NOTIFICATIONS = [
  { id: 1, type: 'like', user: 'jane_doe', avatar: 'https://picsum.photos/100/100?random=10', text: 'liked your video', time: '2m' },
  { id: 2, type: 'follow', user: 'africa_travel', avatar: 'https://picsum.photos/100/100?random=11', text: 'started following you', time: '1h' },
  { id: 3, type: 'comment', user: 'music_lover', avatar: 'https://picsum.photos/100/100?random=12', text: 'commented: "This is fire! 🔥"', time: '3h' },
  { id: 4, type: 'like', user: 'dance_queen', avatar: 'https://picsum.photos/100/100?random=13', text: 'liked your video', time: '5h' },
  { id: 5, type: 'system', user: 'Happy Africa', avatar: '', text: 'Welcome to Happy Africa v1.0!', time: '1d' },
];

const COMMENTS: Comment[] = [
  { id: 1, username: 'kevin_m', text: 'Where is this place? 😍', likes: 24, createdAt: '10m' },
  { id: 2, username: 'sarah_j', text: 'The vibe is immaculate', likes: 12, createdAt: '30m' },
  { id: 3, username: 'travel_addict', text: 'Adding this to my bucket list', likes: 8, createdAt: '1h' },
  { id: 4, username: 'local_guide', text: 'Karibu Kenya! 🇰🇪', likes: 156, createdAt: '2h' },
];

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // User State: Initialize with Default, but can be updated by Auth
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [feedType, setFeedType] = useState<FeedType>('foryou'); // Default Algorithm
  
  // Sheet States
  const [activeSheet, setActiveSheet] = useState<'none' | 'comments' | 'share' | 'gift' | 'wallet'>('none');
  
  // Pending action to execute after login
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Animation States
  const [floatingGifts, setFloatingGifts] = useState<{id: number, emoji: string}[]>([]);

  // Splash Screen Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800); // Show splash for 2.8 seconds (animation duration)
    return () => clearTimeout(timer);
  }, []);

  // Auth Helpers
  const handleRequireAuth = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      setPendingAction(() => action);
      setShowAuthModal(true);
    }
  };

  const handleLoginSuccess = (user?: User) => {
    setIsLoggedIn(true);
    
    if (user) {
        setCurrentUser(user);
    }

    setShowAuthModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleTabChange = (tab: Tab) => {
    // Note: 'live' tab is now accessible, but we should handle it in renderContent
    if (['upload', 'inbox', 'profile'].includes(tab)) {
      handleRequireAuth(() => setActiveTab(tab));
    } else {
      setActiveTab(tab);
    }
  };

  const handleUpload = (newVideo: Video) => {
    // 1. Add to My Videos (Profile)
    setMyVideos([newVideo, ...myVideos]);
    // 2. Inject into Global Feed (Home)
    injectVideo(newVideo);
    // 3. Navigate to Profile to see it
    setActiveTab('profile'); 
  };

  const closeSheet = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveSheet('none');
  };

  const handleSendGift = (gift: any) => {
    if (currentUser.coins >= gift.price) {
      setCurrentUser(prev => ({...prev, coins: prev.coins - gift.price}));
      setActiveSheet('none');
      
      // Trigger Gift Animation
      const newGift = { id: Date.now(), emoji: gift.emoji };
      setFloatingGifts(prev => [...prev, newGift]);
      
      setTimeout(() => {
        setFloatingGifts(prev => prev.filter(g => g.id !== newGift.id));
      }, 2000);

    } else {
       // Prompt Recharge
       setActiveSheet('wallet');
    }
  };

  const handleBuyCoins = (amount: number, cost: string) => {
    if (confirm(`Purchase ${amount} coins for ${cost}?`)) {
      setCurrentUser(prev => ({...prev, coins: prev.coins + amount}));
      setActiveSheet('none');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <VideoFeed 
          key={feedType} // Force remount on type change
          type={feedType} 
          onOpenComments={() => setActiveSheet('comments')}
          onOpenShare={() => setActiveSheet('share')}
          onOpenGift={() => setActiveSheet('gift')}
          onRequireAuth={handleRequireAuth}
          isLoggedIn={isLoggedIn}
        />;
      case 'discover':
        return <Discover onVideoClick={(video) => console.log('Open video', video)} />;
      case 'upload':
        // Protected by handleTabChange, but safe fallback
        return <Upload currentUser={currentUser} onUpload={handleUpload} onCancel={() => setActiveTab('home')} />;
      case 'live':
         // Render the Audience View (Live Feed/Player)
         // In a real app this would be a vertical feed of lives. For now, we open a single live.
         return <LiveViewer 
             currentUser={currentUser} 
             onClose={() => setActiveTab('home')}
             onRequireAuth={handleRequireAuth}
             isLoggedIn={isLoggedIn}
         />;
      case 'inbox':
        // Protected by handleTabChange
        return (
          <div className="h-full bg-brand-indigo text-white overflow-y-auto pb-24">
             <div className="sticky top-0 bg-brand-indigo z-10 p-4 border-b border-white/10 flex justify-center items-center">
                <h2 className="font-bold text-lg">Messages</h2>
                <div className="absolute right-4 bg-brand-dark p-1.5 rounded-md text-brand-pink">
                   <MessageCircle size={16} />
                </div>
             </div>
             
             <div className="p-4">
                <p className="text-gray-400 text-sm font-semibold mb-4">New Activity</p>
                <div className="flex flex-col gap-4">
                   {NOTIFICATIONS.map(notif => (
                     <div key={notif.id} className="flex items-center gap-3 active:bg-brand-dark py-1 rounded transition-colors">
                        <div className="relative">
                           {notif.avatar ? (
                             <img src={notif.avatar} className="w-12 h-12 rounded-full object-cover border border-white/20" />
                           ) : (
                             <div className="w-12 h-12 bg-brand-pink rounded-full flex items-center justify-center font-bold">HA</div>
                           )}
                           {notif.type === 'like' && <div className="absolute bottom-0 right-0 bg-brand-indigo p-0.5 rounded-full"><div className="bg-brand-gold rounded-full p-1"><Heart size={8} fill="white" className="text-white"/></div></div>}
                           {notif.type === 'comment' && <div className="absolute bottom-0 right-0 bg-brand-indigo p-0.5 rounded-full"><div className="bg-blue-500 rounded-full p-1"><MessageCircle size={8} fill="white" className="text-white"/></div></div>}
                        </div>
                        <div className="flex-1">
                           <p className="text-sm">
                              <span className="font-bold text-brand-peach">{notif.user}</span> <span className="text-gray-200">{notif.text}</span>
                           </p>
                           <p className="text-xs text-gray-400">{notif.time}</p>
                        </div>
                        {notif.type === 'follow' ? (
                          <button className="bg-brand-pink text-white px-4 py-1.5 text-xs font-bold rounded">Follow back</button>
                        ) : (
                          <div className="w-10 h-10 bg-brand-dark rounded bg-cover" style={{backgroundImage: 'url(https://picsum.photos/100/100?random=1)'}}></div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
          </div>
        );
      case 'profile':
        // Protected by handleTabChange
        return <Profile 
            user={currentUser} 
            videos={[...myVideos]} 
            onOpenWallet={() => setActiveSheet('wallet')} 
        />;
      default:
        // Use generic feed component but it will initialize based on props
        return <VideoFeed 
          type="foryou"
          onOpenComments={() => setActiveSheet('comments')} 
          onOpenShare={() => setActiveSheet('share')} 
          onOpenGift={() => setActiveSheet('gift')} 
          onRequireAuth={handleRequireAuth}
          isLoggedIn={isLoggedIn}
        />;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-brand-indigo text-white flex">
      {/* Splash Screen */}
      {showSplash && <SplashScreen />}

      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      {/* Architecture: Root Frame Layout */}
      <div 
        className="flex-1 relative h-full flex flex-col items-center justify-center bg-brand-indigo overflow-hidden md:max-w-md mx-auto shadow-2xl transition-all"
      >
        
        {/* Layer 20: Top Header (Overlay on Home Feed) */}
        {activeTab === 'home' && (
           <div className="absolute top-0 left-0 w-full z-20 flex justify-between items-center px-4 pt-safe mt-4 pointer-events-none">
              <Tv size={26} className="text-white/80 pointer-events-auto cursor-pointer hover:text-brand-pink transition-colors drop-shadow-md" onClick={() => setActiveTab('live')} />
              
              {/* BEAUTIFUL "SACCO" (CAPSULE) TOGGLE */}
              <div className="pointer-events-auto bg-black/30 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex items-center shadow-lg">
                  <button 
                    onClick={() => {
                        if (feedType !== 'following') handleRequireAuth(() => setFeedType('following'));
                    }}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                        feedType === 'following' 
                        ? 'bg-brand-pink text-white shadow-md transform scale-105' 
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Following
                  </button>
                  <button 
                    onClick={() => setFeedType('foryou')}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                        feedType === 'foryou' 
                        ? 'bg-brand-pink text-white shadow-md transform scale-105' 
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    For You
                  </button>
              </div>

              {/* Discover/Search Button in Header acts as fallback or quick search if Discover tab is not active */}
              {/* UPDATED TO GOLD COLOR */}
              <Search size={26} className="text-brand-gold cursor-pointer pointer-events-auto hover:text-brand-pink transition-colors drop-shadow-md" onClick={() => setActiveTab('discover')} />
           </div>
        )}
        
        {/* Layer 0: Main Content (Scroll View) */}
        {/* The video feed scrolls independently behind the bottom nav */}
        <div className="w-full h-full relative z-0">
           {renderContent()}
        </div>

        {/* Global Gift Animation Overlay (z-100) */}
        {floatingGifts.map(g => (
          <div 
             key={g.id} 
             className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 pointer-events-none z-[100] animate-float-up"
             style={{ '--rotate': `${Math.random() * 20 - 10}deg` } as React.CSSProperties}
          >
             <div className="text-8xl filter drop-shadow-2xl">{g.emoji}</div>
          </div>
        ))}

        {/* Layer 50: Bottom Nav (Fixed Overlay) */}
        {/* It is absolutely positioned to the bottom, outside the scroll view */}
        {/* Hide nav in Upload and Live Viewer modes */}
        {activeTab !== 'upload' && activeTab !== 'live' && (
           <BottomNav 
              activeTab={activeTab} 
              onTabChange={handleTabChange} 
              isTransparent={activeTab === 'home'} 
           />
        )}

        {/* --- OVERLAYS (Layer 60+) --- */}
        {/* These sit on TOP of the navigation bar */}
        
        {/* Auth Overlay (z-100) */}
        {showAuthModal && (
            <Auth 
                onLogin={handleLoginSuccess} 
                onClose={() => {
                    setShowAuthModal(false);
                    setPendingAction(null);
                }}
            />
        )}

        {/* Wallet Overlay (z-60) */}
        {activeSheet === 'wallet' && (
           <Wallet 
              currentBalance={currentUser.coins} 
              onClose={closeSheet} 
              onBuy={handleBuyCoins} 
           />
        )}

        {/* Comments Bottom Sheet (z-60) */}
        {activeSheet === 'comments' && (
          <CommentsSheet 
            comments={COMMENTS} 
            currentUser={currentUser} 
            onClose={() => setActiveSheet('none')}
            onRequireAuth={handleRequireAuth}
            isLoggedIn={isLoggedIn}
          />
        )}

        {/* Gift Bottom Sheet (z-60) */}
        {activeSheet === 'gift' && (
          <GiftPicker 
            userCoins={currentUser.coins}
            onSendGift={(gift) => handleRequireAuth(() => handleSendGift(gift))}
            onClose={closeSheet}
            onRecharge={() => handleRequireAuth(() => setActiveSheet('wallet'))} 
          />
        )}

        {/* Share Bottom Sheet (z-60) */}
        {activeSheet === 'share' && (
          <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={closeSheet}>
             <div className="absolute bottom-0 w-full bg-brand-dark rounded-t-xl flex flex-col p-4 pb-safe animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                   <span className="font-bold text-sm">Share to</span>
                   <button onClick={closeSheet}><X size={16} className="text-gray-400" /></button>
                </div>
                
                {/* Horizontal Scroll Apps */}
                <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
                   {[{n: 'Whatsapp', c: 'bg-green-500'}, {n: 'Instagram', c: 'bg-brand-pink'}, {n: 'Facebook', c: 'bg-blue-600'}, {n: 'SMS', c: 'bg-green-400'}, {n: 'Email', c: 'bg-blue-400'}].map((app, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 min-w-[60px]">
                         <div className={`w-12 h-12 rounded-full ${app.c} flex items-center justify-center text-white font-bold`}>
                            {app.n[0]}
                         </div>
                         <span className="text-xs text-gray-400">{app.n}</span>
                      </div>
                   ))}
                </div>

                {/* Horizontal Scroll Actions */}
                <div className="flex gap-6 overflow-x-auto border-t border-white/10 pt-4 pb-2 no-scrollbar">
                   {[{n: 'Report', i: Flag}, {n: 'Not Interested', i: X}, {n: 'Save Video', i: Copy}, {n: 'Copy Link', i: Link}].map((Action, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 min-w-[60px]">
                         <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
                            <Action.i size={20} />
                         </div>
                         <span className="text-xs text-gray-400 whitespace-nowrap">{Action.n}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;