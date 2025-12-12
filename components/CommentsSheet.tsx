import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { Comment, User } from '../types';

interface CommentsSheetProps {
  comments: Comment[];
  currentUser: User;
  onClose: () => void;
  onRequireAuth: (cb: () => void) => void;
  isLoggedIn: boolean;
}

export const CommentsSheet: React.FC<CommentsSheetProps> = ({ 
  comments, 
  currentUser, 
  onClose,
  onRequireAuth,
  isLoggedIn
}) => {
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [commentText, setCommentText] = useState('');

  const handleTouchStart = (e: React.TouchEvent) => {
    if (contentRef.current && contentRef.current.scrollTop > 0) return;
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    if (contentRef.current && contentRef.current.scrollTop > 0) return;

    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    if (currentY > 150) {
      handleClose();
    } else {
      setCurrentY(0);
    }
    setStartY(null);
    setIsDragging(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };
  
  const handleSend = () => {
    onRequireAuth(() => {
        if (commentText.trim()) {
            // Send Logic here
            alert("Comment sent!");
            setCommentText('');
        }
    });
  };

  const handleFocus = (e: React.FocusEvent) => {
    // Optional: trigger login on focus?
    // onRequireAuth(() => { /* allow focus */ });
    // Usually TikTok allows focus but maybe login on focus is aggressive. Let's stick to send.
    if (!isLoggedIn) {
        (e.target as HTMLElement).blur();
        onRequireAuth(() => {});
    }
  };

  return (
    <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={handleClose}>
       <div 
         ref={sheetRef}
         className={`absolute bottom-0 w-full h-[70%] bg-brand-dark rounded-t-xl flex flex-col will-change-transform ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}
         style={{ 
           transform: `translateY(${currentY}px)`,
           transition: isDragging ? 'none' : 'transform 0.3s ease-out'
         }}
         onClick={(e) => e.stopPropagation()}
       >
          <div 
            className="w-full flex flex-col items-center pt-2 pb-0 rounded-t-xl cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
             <div className="w-10 h-1 bg-white/20 rounded-full mb-3"></div>
             <div className="w-full flex justify-between items-center px-4 pb-3 border-b border-white/10">
                 <div className="w-4"></div>
                 <span className="font-bold text-xs">{comments.length} comments</span>
                 <button onClick={handleClose}>
                   <X size={14} className="text-gray-400" />
                 </button>
             </div>
          </div>

          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 overscroll-contain"
            onTouchStart={(e) => {
              if (contentRef.current?.scrollTop === 0) handleTouchStart(e);
            }}
            onTouchMove={(e) => {
              if (contentRef.current?.scrollTop === 0) handleTouchMove(e);
            }}
            onTouchEnd={(e) => {
              if (contentRef.current?.scrollTop === 0) handleTouchEnd();
            }}
          >
             {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-brand-indigo overflow-hidden shrink-0 border border-white/10">
                      <img 
                        src={comment.avatarUrl || `https://picsum.photos/100/100?random=${comment.id}`} 
                        className="w-full h-full object-cover" 
                        alt={comment.username}
                      />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-bold text-gray-400 mb-0.5">{comment.username}</p>
                      <p className="text-sm text-gray-200">{comment.text}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                         <span>{comment.createdAt}</span>
                         <span className="font-bold cursor-pointer hover:text-gray-300">Reply</span>
                      </div>
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <Heart size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-500">{comment.likes}</span>
                   </div>
                </div>
             ))}
          </div>

          <div className="p-3 border-t border-white/10 flex items-center gap-3 pb-safe bg-brand-dark">
             <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-white/10">
                {isLoggedIn ? (
                    <img src={currentUser.avatarUrl} className="w-full h-full object-cover" alt="Me" />
                ) : (
                    <div className="w-full h-full bg-brand-indigo"></div>
                )}
             </div>
             <input 
               className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none text-white placeholder-gray-500" 
               placeholder={isLoggedIn ? "Add comment..." : "Log in to comment"}
               value={commentText}
               onChange={(e) => setCommentText(e.target.value)}
               onFocus={handleFocus}
             />
             <button 
                onClick={handleSend}
                className="p-2 text-brand-pink font-bold active:scale-90 transition-transform"
             >
                <Send size={20} />
             </button>
          </div>
       </div>
    </div>
  );
};