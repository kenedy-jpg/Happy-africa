import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Video, Settings, Share2, MessageCircle, Heart, Gift, Camera as CameraIcon, RotateCcw, Zap, Wand2, Smile } from 'lucide-react';
import { User, LiveComment } from '../types';
import { generateBotComment, generateJoinEvent, generateGiftEvent } from '../services/liveService';

interface LiveHostProps {
  currentUser: User;
  onEnd: () => void;
}

type LiveState = 'setup' | 'live' | 'summary';

export const LiveHost: React.FC<LiveHostProps> = ({ currentUser, onEnd }) => {
  const [state, setState] = useState<LiveState>('setup');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Setup State
  const [title, setTitle] = useState("Just chilling! 🌍 #HappyAfrica");
  
  // Live State
  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [diamonds, setDiamonds] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  
  // Simulation Intervals
  const simulationRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
        stopCamera();
        stopSimulation();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', aspectRatio: 9/16 }, 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
  };

  const startSimulation = () => {
    // Initial boost
    setViewers(12);
    
    simulationRef.current = window.setInterval(() => {
        // Randomly fluctuate viewers
        setViewers(prev => Math.max(0, prev + Math.floor(Math.random() * 5) - 2));
        
        // Randomly add likes
        if (Math.random() > 0.3) setLikes(prev => prev + Math.floor(Math.random() * 10));

        // Randomly add comments
        if (Math.random() > 0.6) {
           const newComment = generateBotComment();
           setComments(prev => [newComment, ...prev].slice(0, 50)); // Keep last 50
        }

        // Randomly add joins
        if (Math.random() > 0.7) {
           const joinEvent = generateJoinEvent();
           setComments(prev => [joinEvent, ...prev].slice(0, 50));
        }

        // Randomly receive gifts
        if (Math.random() > 0.95) {
           const giftEvent = generateGiftEvent();
           setDiamonds(prev => prev + 5);
           setComments(prev => [giftEvent, ...prev].slice(0, 50));
        }
    }, 1000);

    timerRef.current = window.setInterval(() => {
        setDurationSec(prev => prev + 1);
    }, 1000);
  };

  const stopSimulation = () => {
     if (simulationRef.current) clearInterval(simulationRef.current);
     if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleGoLive = () => {
     if (currentUser.followers < 1000) {
        // Normally check followers, but bypassing for demo
        // alert(`You need 1k followers to go live. (Bypassed)`);
     }
     setState('live');
     startSimulation();
  };

  const handleEndLive = () => {
     stopSimulation();
     setState('summary');
  };

  const formatTime = (seconds: number) => {
     const mins = Math.floor(seconds / 60);
     const secs = seconds % 60;
     return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- RENDERERS ---

  if (state === 'summary') {
     return (
        <div className="absolute inset-0 bg-brand-indigo z-[100] flex flex-col items-center justify-center p-6 animate-fade-in">
           <h2 className="text-2xl font-bold text-white mb-8">Live Ended</h2>
           
           <div className="bg-brand-dark w-full rounded-xl p-6 border border-white/10 shadow-xl mb-8">
              <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                  <img src={currentUser.avatarUrl} className="w-16 h-16 rounded-full border-2 border-brand-pink" />
                  <div>
                      <p className="font-bold text-lg text-white">{currentUser.displayName}</p>
                      <p className="text-gray-400 text-sm">@{currentUser.username}</p>
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-6">
                  <div className="flex flex-col">
                      <span className="text-gray-400 text-xs uppercase">Viewers</span>
                      <span className="text-2xl font-bold text-white">{viewers + 142}</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-gray-400 text-xs uppercase">Diamonds</span>
                      <span className="text-2xl font-bold text-brand-gold">{diamonds}</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-gray-400 text-xs uppercase">New Followers</span>
                      <span className="text-2xl font-bold text-brand-pink">+{Math.floor(likes / 10)}</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-gray-400 text-xs uppercase">Duration</span>
                      <span className="text-2xl font-bold text-white">{formatTime(durationSec)}</span>
                  </div>
              </div>
           </div>

           <button onClick={onEnd} className="w-full bg-white/10 py-4 rounded-full font-bold text-white hover:bg-white/20 transition-colors">
              Close
           </button>
        </div>
     );
  }

  return (
    <div className="absolute inset-0 bg-black z-[60] flex flex-col">
       {/* Camera Feed */}
       <div className="absolute inset-0 z-0">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]" 
          />
       </div>

       {/* SETUP MODE UI */}
       {state === 'setup' && (
          <div className="relative z-10 flex flex-col h-full bg-black/40 backdrop-blur-sm p-6 pt-safe pb-safe animate-fade-in">
             <div className="flex justify-between items-center mb-8">
                <button onClick={onEnd}><X size={28} className="text-white" /></button>
                <div className="bg-black/40 px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-white">Great Connection</span>
                </div>
             </div>

             <div className="bg-brand-dark/80 p-4 rounded-xl flex gap-4 mb-6 border border-white/10">
                 <div className="w-20 h-20 bg-gray-800 rounded-lg relative overflow-hidden flex items-center justify-center">
                    <CameraIcon className="text-gray-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-bold">Edit Cover</div>
                 </div>
                 <div className="flex-1">
                    <input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-transparent text-white font-bold text-lg w-full outline-none placeholder-gray-400"
                      placeholder="Add a title to chat..."
                    />
                    <div className="flex gap-2 mt-2">
                       <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-brand-pink">#HappyAfrica</span>
                       <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white">#Chill</span>
                    </div>
                 </div>
             </div>

             <div className="flex-1"></div>

             {/* Setup Controls */}
             <div className="grid grid-cols-4 gap-4 mb-8">
                 {[
                   {l: 'Flip', i: RotateCcw}, {l: 'Enhance', i: Wand2}, {l: 'Effects', i: Smile}, {l: 'Share', i: Share2}
                 ].map((opt, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 text-white opacity-80 hover:opacity-100 cursor-pointer">
                       <opt.i size={24} />
                       <span className="text-xs">{opt.l}</span>
                    </div>
                 ))}
             </div>

             <button 
               onClick={handleGoLive}
               className="w-full bg-brand-pink py-4 rounded-full font-bold text-white text-lg shadow-lg shadow-brand-pink/30 hover:brightness-110 active:scale-95 transition-all"
             >
                Go LIVE
             </button>
          </div>
       )}

       {/* LIVE MODE UI */}
       {state === 'live' && (
          <div className="relative z-10 flex flex-col h-full pt-safe pb-safe">
              {/* Top Bar */}
              <div className="flex justify-between items-start p-4">
                  <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full p-1 pr-4">
                      <img src={currentUser.avatarUrl} className="w-9 h-9 rounded-full border border-brand-pink" />
                      <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{currentUser.username}</span>
                          <span className="text-[10px] text-brand-gold font-bold flex items-center gap-1">
                             <Gift size={8} /> {diamonds}
                          </span>
                      </div>
                      <button className="bg-brand-pink text-white text-[10px] font-bold px-2 py-0.5 rounded ml-2">Follow</button>
                  </div>

                  <div className="flex gap-2">
                      <div className="flex flex-col items-center bg-black/20 backdrop-blur-md px-3 py-1 rounded-lg">
                          <span className="text-xs font-bold text-white">{viewers}</span>
                          <span className="text-[8px] text-gray-300 uppercase">Viewers</span>
                      </div>
                      <button onClick={handleEndLive} className="w-9 h-9 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center">
                          <X size={18} className="text-white" />
                      </button>
                  </div>
              </div>

              {/* Middle Area (Empty for view) */}
              <div className="flex-1"></div>

              {/* Chat Area */}
              <div className="h-64 px-4 overflow-y-auto no-scrollbar mask-image-gradient">
                 <div className="flex flex-col gap-2 justify-end min-h-full pb-4">
                    <div className="bg-brand-pink/80 self-start px-3 py-1 rounded-lg text-xs text-white font-bold mb-2">
                       Welcome to TikTok LIVE! Be nice.
                    </div>
                    {comments.map((comment) => (
                       <div key={comment.id} className="flex items-center gap-2 animate-slide-right">
                          {comment.isSystem ? (
                             <div className="bg-black/30 px-3 py-1 rounded-full text-xs text-white">
                                <span className="font-bold text-gray-300">{comment.username}</span> {comment.text}
                             </div>
                          ) : (
                             <div className="flex items-start gap-2 bg-black/20 px-3 py-1.5 rounded-xl max-w-[80%]">
                                <span className="text-xs font-bold text-gray-300 whitespace-nowrap">{comment.username}:</span>
                                <span className="text-xs text-white">{comment.text}</span>
                             </div>
                          )}
                       </div>
                    ))}
                 </div>
              </div>

              {/* Bottom Bar */}
              <div className="flex items-center gap-3 px-4 py-2 border-t border-white/5">
                 <div className="flex-1 bg-black/30 rounded-full px-4 py-2 text-gray-400 text-sm flex items-center gap-2">
                    <MessageCircle size={16} />
                    <span>Say something...</span>
                 </div>
                 <div className="flex gap-3 text-white">
                    <Settings size={24} className="opacity-80" />
                    <Gift size={24} className="opacity-80" />
                    <Share2 size={24} className="opacity-80" />
                 </div>
              </div>
          </div>
       )}
    </div>
  );
};