import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Zap, Check, Music } from 'lucide-react';
import { MusicPicker } from './MusicPicker';

interface CameraCaptureProps {
  onCapture: (blobUrl: string) => void;
  onClose: () => void;
  onSelectMusic: (trackName: string) => void;
  selectedMusic: string | null;
  onSwitchToLive?: () => void; // New prop
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, onSelectMusic, selectedMusic, onSwitchToLive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<number | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  
  // Modes
  const MODES = ['Photo', '15s', '60s', 'Template', 'LIVE'];
  const [activeMode, setActiveMode] = useState('15s');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
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
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!stream) return;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(blob);
      onCapture(videoUrl);
    };

    mediaRecorder.start();
    setIsRecording(true);

    // Progress Simulation
    let p = 0;
    progressInterval.current = window.setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) stopRecording();
    }, 150); // 15 seconds max
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
  };
  
  const handleModeSelect = (mode: string) => {
      setActiveMode(mode);
      if (mode === 'LIVE' && onSwitchToLive) {
          onSwitchToLive();
      }
  };

  return (
    <div className="absolute inset-0 bg-brand-indigo z-50 flex flex-col">
      {/* Viewfinder */}
      <div className="relative flex-1 bg-brand-dark rounded-b-2xl overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform scale-x-[-1]" 
        />
        
        {/* Top Controls */}
        <div className="absolute top-4 left-0 w-full px-4 pt-safe flex justify-between items-center z-10 text-white shadow-md">
           <button onClick={onClose}><X size={28} /></button>
           
           <button 
             onClick={() => setShowMusicPicker(true)}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 backdrop-blur-md ${
               selectedMusic ? 'bg-brand-pink text-white' : 'bg-black/40 text-white'
             }`}
           >
              <Music size={14} />
              <span className="max-w-[120px] truncate">{selectedMusic || "Add sound"}</span>
           </button>

           <button className="flex flex-col items-center gap-1 opacity-0">
              <RotateCcw size={24} />
           </button>
        </div>

        {/* Right Sidebar Controls */}
        <div className="absolute right-4 top-20 flex flex-col gap-6 text-white items-center drop-shadow-md z-10">
            <button className="flex flex-col items-center gap-1">
              <RotateCcw size={24} />
              <span className="text-[10px] font-medium">Flip</span>
            </button>
            <div className="flex flex-col items-center gap-1">
               <Zap size={24} />
               <span className="text-[10px] font-medium">Speed</span>
            </div>
            <div className="flex flex-col items-center gap-1">
               <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px]">3m</div>
               <span className="text-[10px] font-medium">Timer</span>
            </div>
            <div className="flex flex-col items-center gap-1">
               <div className="w-6 h-6 rounded-full bg-gray-800/50 border border-white/50"></div>
               <span className="text-[10px] font-medium">Filters</span>
            </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="h-36 bg-brand-indigo flex flex-col items-center justify-end pb-safe relative">
          
          {/* Scrollable Modes */}
          <div className="flex gap-6 text-sm font-bold text-gray-500 mb-6 overflow-x-auto w-full justify-center px-10 no-scrollbar items-center">
             {MODES.map(mode => (
                 <button 
                    key={mode} 
                    onClick={() => handleModeSelect(mode)}
                    className={`transition-all whitespace-nowrap px-2 py-0.5 rounded-full ${activeMode === mode ? 'text-white bg-white/20' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                    {mode}
                 </button>
             ))}
          </div>

          <div className="flex items-center justify-between w-full px-12 mb-6">
             {/* Effects / Gallery Placeholder */}
             <div className="flex flex-col items-center gap-1 text-white opacity-80">
                 <div className="w-8 h-8 rounded-lg bg-brand-dark border-2 border-brand-pink/50 flex items-center justify-center">
                    <Zap size={16} className="text-brand-pink" />
                 </div>
                 <span className="text-[10px] font-bold">Effects</span>
             </div>
             
             {/* Record Button */}
             <button 
               onClick={handleRecordToggle}
               className={`relative w-20 h-20 rounded-full border-[5px] transition-all duration-200 flex items-center justify-center ${isRecording ? 'border-brand-pink/50 scale-110' : 'border-white'}`}
             >
                <div className={`bg-brand-pink rounded-full transition-all duration-200 ${isRecording ? 'w-8 h-8 rounded-sm' : 'w-16 h-16'}`}></div>
                
                {/* Progress Ring */}
                {isRecording && (
                   <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="50%" cy="50%" r="36" fill="none" stroke="#FF4F9A" strokeWidth="4" strokeDasharray="226" strokeDashoffset={226 - (226 * progress) / 100} />
                   </svg>
                )}
             </button>

             {/* Upload Placeholder (Handled by parent but visual here) */}
             <div className="flex flex-col items-center gap-1 opacity-0 pointer-events-none">
                 <div className="w-8 h-8"></div>
             </div>
          </div>
      </div>

      {showMusicPicker && (
        <MusicPicker 
          onSelect={(track) => {
            onSelectMusic(`${track.title} • ${track.artist}`);
            setShowMusicPicker(false);
          }} 
          onClose={() => setShowMusicPicker(false)} 
        />
      )}
    </div>
  );
};