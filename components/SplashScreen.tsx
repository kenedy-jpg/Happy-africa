import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-out" style={{ animationDelay: '2.5s', animationFillMode: 'forwards', pointerEvents: 'none' }}>
      
      {/* Logo Container */}
      <div className="relative mb-8 animate-pulse-slow">
        {/* Gradient Background Box */}
        <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-b from-[#FF9E80] to-[#FFD700] shadow-[0_0_60px_rgba(255,79,154,0.3)] flex items-center justify-center relative overflow-hidden">
           
           {/* Music Note (Black) */}
           <svg viewBox="0 0 24 24" className="w-28 h-28 text-black relative z-10" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
           </svg>

           {/* Africa Map (Overlay/Cutout effect simulated via absolute positioning) */}
           {/* Since we can't easily cut out the SVG path from the note in pure JSX without complex masking, 
               we place the map centered over the note's bulb area or stylized behind it. 
               Given the user's image shows a black circle/globe with Africa inside: */}
           <div className="absolute bottom-6 left-6 w-16 h-16 bg-black rounded-full flex items-center justify-center z-20">
              {/* Africa Map Shape (Simplified) */}
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-br from-[#FF6B00] to-[#FFD700]" style={{ fill: 'url(#africaGradient)' }}>
                 <defs>
                    <linearGradient id="africaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#FF9E80" />
                       <stop offset="100%" stopColor="#FFD700" />
                    </linearGradient>
                 </defs>
                 <path d="M52.5,15 C45,15 40,20 38,25 C36,30 30,35 25,38 C20,40 18,45 20,50 C22,55 25,58 28,65 C30,70 35,85 45,90 C50,92 55,85 58,80 C60,75 65,70 70,65 C75,60 78,55 75,45 C72,35 75,30 65,25 C60,22 58,15 52.5,15 Z" /> 
                 {/* Simplified artistic representation of Africa */}
              </svg>
           </div>
        </div>
      </div>

      {/* Text Branding */}
      <div className="flex flex-col items-center">
         <h1 className="text-5xl font-black text-brand-pink tracking-tight drop-shadow-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
            HAPPY
         </h1>
         <h1 className="text-5xl font-black text-brand-pink tracking-tight drop-shadow-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
            AFRICA
         </h1>
      </div>

      <div className="absolute bottom-10 text-white/40 text-xs font-bold tracking-widest uppercase">
         Loading Vibes...
      </div>
    </div>
  );
};