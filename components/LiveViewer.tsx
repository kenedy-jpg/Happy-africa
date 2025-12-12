import React, { useState, useEffect, useRef } from 'react';
import { User, LiveComment } from '../types';
import { X, Share2, MessageCircle, Gift, Heart, UserPlus, Send, Coins } from 'lucide-react';
import { generateBotComment, generateJoinEvent, generateGiftEvent } from '../services/liveService';
import { GiftPicker } from './GiftPicker';
import { Wallet } from './Wallet';

interface LiveViewerProps {
  currentUser: User;
  onClose: () => void;
  onRequireAuth: (cb: () => void) => void;
  isLoggedIn: boolean;
}

// Mock Host User
const HOST_USER: User = {
  id: 'host1',
  username: 'safari_guides_ke',
  displayName: 'Safari Live 🦁',
  avatarUrl: 'https://picsum.photos/100/100?random=50',
  followers: 15400,
  following: 10,
  likes: 50000,
  coins: 0
};

export const LiveViewer: React.FC<LiveViewerProps> = ({ currentUser, onClose, onRequireAuth, isLoggedIn }) => {
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [viewers, setViewers] = useState(1205);
  const [likes, setLikes] = useState(4500);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [userCoins, setUserCoins] = useState(currentUser.coins);
  const [floatingHearts, setFloatingHearts] = useState<{id: number, x: number, y: number}[]>([]);
  const [floatingGifts, setFloatingGifts] = useState<{id: number, emoji: string}[]>([]);

  const simulationRef = useRef<number | null>(null);

  useEffect(() => {
    startSimulation();
    return () => stopSimulation();
  }, []);

  const startSimulation = () => {
    simulationRef.current = window.setInterval(() => {
        // Randomly add comments
        if (Math.random() > 0.5) {
           const newComment = generateBotComment();
           setComments(prev => [newComment, ...prev].slice(0, 50)); 
        }
        // Randomly add likes
        if (Math.random() > 0.2) setLikes(prev => prev + Math.floor(Math.random() * 5));
        
        // Randomly receive gifts
        if (Math.random() > 0.9) {
           const giftEvent = generateGiftEvent();
           setComments(prev => [giftEvent, ...prev].slice(0, 50));
        }
    }, 800);
  };

  const stopSimulation = () => {
    if (simulationRef.current) clearInterval(simulationRef.current);
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    
    onRequireAuth(() => {
        const newComment: LiveComment = {
            id: Date.now().toString(),
            username: currentUser.username,
            avatarUrl: currentUser.avatarUrl,
            text: commentText
        };
        setComments(prev => [newComment, ...prev]);
        setCommentText('');
    });
  };

  const handleLike = () => {
     onRequireAuth(() => {
         setLikes(prev => prev + 1);
         const id = Date.now();
         setFloatingHearts(prev => [...prev, { id, x: Math.random() * 40, y: 0 }]);
         setTimeout(() => {
             setFloatingHearts(prev => prev.filter(h => h.id !== id));
         }, 1000);
     });
  };

  const handleSendGift = (gift: any) => {
     if (userCoins >= gift.price) {
        setUserCoins(prev => prev - gift.price);
        setShowGiftPicker(false);
        
        // Send Gift Message
        const giftMsg: LiveComment = {
            id: Date.now().toString(),
            username: currentUser.username,
            avatarUrl: currentUser.avatarUrl,
            text: `sent ${gift.name} ${gift.emoji}`,
            isSystem: true
        };
        setComments(prev => [giftMsg, ...prev]);

        // Animate
        const gId = Date.now();
        setFloatingGifts(prev => [...prev, { id: gId, emoji: gift.emoji }]);
        setTimeout(() => setFloatingGifts(prev => prev.filter(g => g.id !== gId)), 2000);

     } else {
        setShowWallet(true);
     }
  };

  return (
    <div className="fixed inset-0 bg-black z-[50] flex flex-col animate-slide-up">
       {/* Background Video (Mock Stream) */}
       <div className="absolute inset-0 z-0 bg-gray-900">
           <video 
             src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
             autoPlay
             loop
             muted={false}
             playsInline
             className="w-full h-full object-cover opacity-80"
           />
       </div>

       {/* Floating Hearts Animation */}
       {floatingHearts.map(h => (
           <div key={h.id} className="absolute bottom-20 right-4 animate-float-up z-20 pointer-events-none">
              <Heart size={30} className="fill-brand-pink text-brand-pink" />
           </div>
       ))}

        {/* Floating Gifts Animation */}
       {floatingGifts.map(g => (
           <div key={g.id} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float-up z-50 pointer-events-none">
              <span className="text-9xl drop-shadow-2xl">{g.emoji}</span>
           </div>
       ))}

       {/* Top UI */}
       <div className="relative z-10 pt-safe px-4 pt-4 flex justify-between items-start">
           <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full p-1 pr-4 border border-white/10">
               <img src={HOST_USER.avatarUrl} className="w-8 h-8 rounded-full border border-brand-pink" />
               <div className="flex flex-col">
                   <span className="text-xs font-bold text-white">{HOST_USER.displayName}</span>
                   <span className="text-[9px] text-white/80">{HOST_USER.followers} Followers</span>
               </div>
               <button className="bg-brand-pink text-white text-[10px] font-bold px-3 py-1 rounded-full ml-1 flex items-center gap-1">
                  <UserPlus size={10} /> Follow
               </button>
           </div>

           <div className="flex gap-2 items-center">
               <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full flex flex-col items-center border border-white/10">
                   <span className="text-xs font-bold text-white">{viewers}</span>
                   <span className="text-[8px] uppercase text-gray-300">Viewers</span>
               </div>
               <button onClick={onClose} className="w-8 h-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                   <X size={16} className="text-white" />
               </button>
           </div>
       </div>

       {/* Live Badge */}
       <div className="relative z-10 px-4 mt-2">
           <span className="bg-brand-pink text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg shadow-brand-pink/50 animate-pulse">
              LIVE
           </span>
       </div>

       <div className="flex-1" onClick={handleLike}></div>

       {/* Bottom Chat Area */}
       <div className="relative z-10 h-1/3 px-4 flex flex-col justify-end pb-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
           <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col-reverse mask-image-gradient">
              {comments.slice(0, 15).map(comment => (
                  <div key={comment.id} className="mb-2 flex items-start">
                     {comment.isSystem ? (
                         <div className="bg-brand-gold/20 border border-brand-gold/30 px-3 py-1 rounded-full text-xs text-brand-gold font-bold">
                            {comment.username} {comment.text}
                         </div>
                     ) : (
                         <div className="bg-black/30 px-3 py-1.5 rounded-xl max-w-[85%] backdrop-blur-sm">
                             <span className="text-xs font-bold text-gray-300 mr-2">{comment.username}</span>
                             <span className="text-xs text-white">{comment.text}</span>
                         </div>
                     )}
                  </div>
              ))}
           </div>
           
           {/* Controls */}
           <div className="flex items-center gap-3 mt-3 pb-safe">
              <div className="flex-1 relative">
                 <input 
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   className="w-full bg-black/40 border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-sm text-white outline-none placeholder-gray-400 backdrop-blur-md"
                   placeholder="Say hi..."
                   onFocus={() => onRequireAuth(() => {})}
                 />
                 <button 
                   onClick={handleSendComment}
                   className={`absolute right-1 top-1 p-1.5 rounded-full ${commentText ? 'bg-brand-pink text-white' : 'text-gray-500'}`}
                 >
                    <Send size={16} />
                 </button>
              </div>
              
              <div className="flex gap-3 text-white items-center">
                 <button className="flex flex-col items-center" onClick={() => onRequireAuth(() => setShowGiftPicker(true))}>
                    <Gift size={28} className="text-white drop-shadow-md" />
                 </button>
                 <button className="flex flex-col items-center">
                    <Share2 size={28} className="text-white drop-shadow-md" />
                 </button>
                 <button className="flex flex-col items-center bg-white/10 p-2 rounded-full active:scale-90 transition-transform" onClick={handleLike}>
                    <Heart size={24} className="text-brand-pink fill-brand-pink" />
                 </button>
              </div>
           </div>
       </div>

       {showGiftPicker && (
          <GiftPicker 
             userCoins={userCoins} 
             onSendGift={handleSendGift} 
             onClose={() => setShowGiftPicker(false)}
             onRecharge={() => {
                setShowGiftPicker(false);
                setShowWallet(true);
             }}
          />
       )}
       
       {showWallet && (
           <Wallet 
              currentBalance={userCoins} 
              onClose={() => setShowWallet(false)}
              onBuy={(amount) => {
                  setUserCoins(prev => prev + amount);
                  setShowWallet(false);
                  setShowGiftPicker(true);
              }}
           />
       )}
    </div>
  );
};