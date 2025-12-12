import React, { useState, useRef, useEffect } from 'react';
import { Video, User } from '../types';
import { generateMagicCaption } from '../services/geminiService';
import { Sparkles, Upload as UploadIcon, X, Camera, Image, Scissors, Check, ChevronRight, Play, Pause, ChevronLeft, ShieldCheck, Loader, Type, Sticker, Mic, Wand2, Music as MusicIcon, Save } from 'lucide-react';
import { CameraCapture } from './CameraCapture';
import { MusicPicker, MusicTrack } from './MusicPicker';
import { LiveHost } from './LiveHost';

interface UploadProps {
  currentUser: User;
  onUpload: (newVideo: Video) => void;
  onCancel: () => void;
}

type Mode = 'capture' | 'edit' | 'details' | 'processing' | 'live';

export const Upload: React.FC<UploadProps> = ({ currentUser, onUpload, onCancel }) => {
  const [mode, setMode] = useState<Mode>('capture');
  const [mediaType, setMediaType] = useState<'video' | 'slideshow'>('video');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]); // For Slideshows
  
  // Music State: Now stores the full track object for playback
  const [musicTrack, setMusicTrack] = useState<MusicTrack | null>(null);
  
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMusicPicker, setShowMusicPicker] = useState(false);

  // Editor State
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0); // For slideshow preview
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const slideshowInterval = useRef<number | null>(null);

  // Processing State
  const [processStep, setProcessStep] = useState(0);
  const PROCESS_STEPS = [
    "Compressing video...",
    "Extracting features...",
    "Mapping audio...",
    "Checking content safety (AI)...",
    "Finalizing..."
  ];

  // --- HANDLERS ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const isVideo = files[0].type.startsWith('video');

      if (isVideo) {
         // Handle Single Video
         const url = URL.createObjectURL(files[0]);
         setFileUrl(url);
         setMediaType('video');
      } else {
         // Handle Photos (Slideshow)
         const imageUrls = files.map(f => URL.createObjectURL(f));
         setImages(imageUrls);
         setMediaType('slideshow');
      }
      setMode('edit');
    }
  };

  const handleCameraCapture = (blobUrl: string) => {
    setFileUrl(blobUrl);
    setMediaType('video');
    setMode('edit');
  };

  const handleSlideshowPlayback = () => {
    if (mediaType === 'slideshow' && images.length > 1) {
       if (slideshowInterval.current) clearInterval(slideshowInterval.current);
       if (isPlaying) {
          slideshowInterval.current = window.setInterval(() => {
             setActiveImageIndex(prev => (prev + 1) % images.length);
          }, 2000); // 2s per slide
       }
    }
  };

  // Sync Audio Playback with Video/Slideshow state
  useEffect(() => {
     if (audioRef.current) {
        if (isPlaying) {
           audioRef.current.play().catch(() => {});
        } else {
           audioRef.current.pause();
        }
     }
  }, [isPlaying, musicTrack]);

  useEffect(() => {
     handleSlideshowPlayback();
     return () => {
        if (slideshowInterval.current) clearInterval(slideshowInterval.current);
     };
  }, [mode, isPlaying, images]);

  const handleGenerateCaption = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    const caption = await generateMagicCaption(description);
    setDescription(caption);
    setIsGenerating(false);
  };

  const handlePost = () => {
     if (audioRef.current) audioRef.current.pause();
     setMode('processing');
     
     // Simulate Internal TikTok Processing Steps
     let step = 0;
     const interval = setInterval(() => {
        step++;
        setProcessStep(step);
        if (step >= PROCESS_STEPS.length) {
           clearInterval(interval);
           completeUpload();
        }
     }, 800);
  };

  const completeUpload = () => {
      const newVideo: Video = {
        id: `v${Date.now()}`,
        url: mediaType === 'video' ? fileUrl! : undefined,
        images: mediaType === 'slideshow' ? images : undefined,
        type: mediaType,
        poster: mediaType === 'video' ? 'https://picsum.photos/400/800' : images[0],
        description: description,
        hashtags: ['#new', '#happyafrica'],
        likes: 0,
        comments: 0,
        shares: 0,
        user: currentUser,
        musicTrack: musicTrack ? `${musicTrack.title} • ${musicTrack.artist}` : 'Original Sound',
        category: 'dance'
      };
      onUpload(newVideo);
  };
  
  const handleSelectMusic = (track: MusicTrack) => {
     setMusicTrack(track);
     setShowMusicPicker(false);
     // Auto start playing when track selected
     setIsPlaying(true);
  };

  // --- RENDERERS ---

  if (mode === 'live') {
      return <LiveHost currentUser={currentUser} onEnd={onCancel} />;
  }

  if (mode === 'capture') {
     return (
       <div className="w-full h-full bg-brand-indigo flex flex-col relative z-50">
          <CameraCapture 
            onCapture={handleCameraCapture} 
            onClose={onCancel} 
            onSwitchToLive={() => setMode('live')}
            onSelectMusic={(name) => {
               console.log("Music selected in camera:", name);
            }}
            selectedMusic={musicTrack ? `${musicTrack.title}` : null}
          />
          
          {/* Upload Button Overlay (To simulate opening Gallery from Camera) */}
          <div className="absolute bottom-10 right-10 flex flex-col items-center gap-1 z-50 cursor-pointer active:scale-95 transition-transform">
             <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center relative overflow-hidden">
                <Image size={16} className="text-white" />
                <input 
                   type="file" 
                   multiple 
                   accept="video/*,image/*"
                   className="absolute inset-0 opacity-0"
                   onChange={handleFileSelect}
                />
             </div>
             <span className="text-[10px] font-bold text-white">Upload</span>
          </div>
       </div>
     );
  }

  if (mode === 'processing') {
      return (
          <div className="w-full h-full bg-brand-indigo flex flex-col items-center justify-center z-50 animate-fade-in px-8 text-center">
              <div className="relative mb-8">
                 <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center">
                    <Loader size={40} className="text-brand-pink animate-spin" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-2 border-4 border-brand-indigo">
                    <ShieldCheck size={20} className="text-white" />
                 </div>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">Processing Video</h2>
              <p className="text-gray-400 text-sm h-6 transition-all duration-300">
                 {PROCESS_STEPS[Math.min(processStep, PROCESS_STEPS.length - 1)]}
              </p>
              
              <div className="mt-8 w-64 bg-brand-dark h-1.5 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-brand-pink transition-all duration-300 ease-out" 
                   style={{width: `${(processStep / PROCESS_STEPS.length) * 100}%`}}
                 ></div>
              </div>
          </div>
      );
  }

  // Common Header for Edit/Details
  const Header = ({ title, onBack, onNext }: any) => (
    <div className="flex justify-between items-center p-4 pt-safe border-b border-white/10 bg-brand-indigo/90 z-20">
        <button onClick={onBack}><ChevronLeft className="text-white" /></button>
        <h2 className="text-white font-bold text-md">{title}</h2>
        <button 
            onClick={onNext} 
            className="bg-brand-pink text-white px-4 py-1.5 rounded-sm text-sm font-bold flex items-center gap-1 shadow-lg shadow-brand-pink/20"
        >
            {mode === 'details' ? 'Post' : 'Next'}
        </button>
    </div>
  );

  if (mode === 'edit') {
      return (
        <div className="w-full h-full bg-brand-indigo flex flex-col relative z-50 animate-slide-up">
            <Header title="Edit" onBack={() => setMode('capture')} onNext={() => setMode('details')} />

            {/* Preview Area */}
            <div className="flex-1 relative bg-brand-dark overflow-hidden" onClick={() => setIsPlaying(!isPlaying)}>
                {/* Audio Element for Music */}
                {musicTrack && musicTrack.audioUrl && (
                   <audio 
                      ref={audioRef} 
                      src={musicTrack.audioUrl} 
                      loop 
                      className="hidden" 
                   />
                )}

                {mediaType === 'video' ? (
                   <video 
                     ref={videoRef}
                     src={fileUrl!}
                     className="w-full h-full object-contain"
                     autoPlay={isPlaying}
                     loop
                     playsInline
                     // If music is selected, we mute the original video audio usually, 
                     // or mix it. For simplicity here, if music is present, mute video.
                     muted={!!musicTrack} 
                   />
                ) : (
                   <div className="w-full h-full relative">
                      {/* Slideshow Renderer */}
                      {images.map((img, idx) => (
                         <img 
                           key={idx} 
                           src={img} 
                           className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${idx === activeImageIndex ? 'opacity-100' : 'opacity-0'}`}
                         />
                      ))}
                      {/* Simulated Transitions/Motion */}
                      <div className={`absolute inset-0 bg-black/10 pointer-events-none transition-transform duration-[2000ms] ease-linear ${activeImageIndex % 2 === 0 ? 'scale-105' : 'scale-100'}`}></div>
                   </div>
                )}

                {/* Play/Pause Overlay */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                        <Play size={48} className="text-white/80 fill-white" />
                    </div>
                )}
            </div>

            {/* Editing Sidebar (Right) */}
            <div className="absolute top-20 right-4 flex flex-col gap-6 items-center z-10">
               {[
                 { icon: Type, label: 'Text' },
                 { icon: Sticker, label: 'Stickers' },
                 { icon: Wand2, label: 'Effects' },
                 { icon: Scissors, label: 'Edit' },
                 { icon: Mic, label: 'Voice' },
               ].map((tool, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 text-white drop-shadow-md cursor-pointer active:scale-90 transition-transform hover:text-brand-pink">
                     <tool.icon size={24} strokeWidth={2.5} />
                     <span className="text-[10px] font-bold">{tool.label}</span>
                  </div>
               ))}
            </div>

            {/* Bottom Controls */}
            <div className="h-auto bg-brand-indigo p-4 pb-safe border-t border-white/10">
                {/* Music Bar */}
                <div 
                   className={`flex items-center justify-center gap-2 text-white py-2 rounded mb-4 cursor-pointer hover:bg-white/20 transition-colors ${
                     musicTrack ? 'bg-brand-pink/20 border border-brand-pink/50' : 'bg-white/10'
                   }`}
                   onClick={() => setShowMusicPicker(true)}
                >
                   <MusicIcon size={14} className={musicTrack ? 'text-brand-pink' : 'text-white'} />
                   <div className="flex flex-col items-start truncate max-w-[200px]">
                      <span className="text-xs font-bold">{musicTrack ? musicTrack.title : "Add sound"}</span>
                      {musicTrack && <span className="text-[10px] text-gray-300">{musicTrack.artist}</span>}
                   </div>
                </div>
                
                {mediaType === 'slideshow' && (
                   <p className="text-center text-gray-500 text-xs">Photos synced to beat • {images.length} clips</p>
                )}
                {mediaType === 'video' && (
                   <div className="w-full h-10 bg-brand-dark rounded overflow-hidden relative opacity-50">
                      <div className="absolute inset-0 flex">
                         {[...Array(10)].map((_,i) => <div key={i} className="flex-1 border-r border-white/5"></div>)}
                      </div>
                      <div className="absolute top-0 bottom-0 left-[10%] right-[10%] border-x-4 border-brand-gold bg-brand-gold/20"></div>
                   </div>
                )}
            </div>

            {showMusicPicker && (
               <MusicPicker 
                 onSelect={handleSelectMusic} 
                 onClose={() => setShowMusicPicker(false)} 
               />
            )}
        </div>
      );
  }

  if (mode === 'details') {
    return (
      <div className="w-full h-full bg-brand-indigo flex flex-col relative z-50 animate-slide-right">
        <Header title="Post" onBack={() => setMode('edit')} onNext={handlePost} />

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          <div className="flex gap-4">
             {/* Thumbnail */}
             <div className="w-20 h-28 bg-brand-dark rounded overflow-hidden relative shrink-0">
               {mediaType === 'video' ? (
                  <video src={fileUrl!} className="w-full h-full object-cover" muted />
               ) : (
                  <img src={images[0]} className="w-full h-full object-cover" />
               )}
               <div className="absolute bottom-1 left-1 text-[10px] text-white font-bold bg-black/50 px-1 rounded">Select cover</div>
             </div>
             
             {/* Caption Input */}
             <div className="flex-1">
               <textarea 
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 placeholder="Describe your post, add hashtags, or mention creators..."
                 className="w-full bg-transparent text-white text-sm outline-none resize-none h-24 placeholder-gray-500"
               />
               <button 
                  onClick={handleGenerateCaption}
                  disabled={isGenerating || description.length === 0}
                  className="flex items-center gap-1 text-xs font-bold text-brand-pink mt-2 bg-brand-pink/10 px-2 py-1 rounded w-fit hover:bg-brand-pink/20"
               >
                  <Sparkles size={12} />
                  {isGenerating ? 'Generating...' : 'AI Caption'}
               </button>
             </div>
          </div>

          {musicTrack && (
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded">
                 <MusicIcon size={14} className="text-gray-400" />
                 <span className="text-xs text-gray-300">Sound: <b>{musicTrack.title}</b></span>
              </div>
          )}

          <div className="flex flex-col gap-0 border-t border-white/10 mt-2">
             {['Who can view this video', 'Allow comments', 'Allow Duet', 'Allow Stitch', 'Save to device'].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-white/10 cursor-pointer active:bg-white/5">
                   <div className="flex items-center gap-2">
                       {i === 4 && <Save size={16} className="text-gray-400" />}
                       <span className="text-sm font-medium text-gray-200">{item}</span>
                   </div>
                   <div className="flex items-center gap-1 text-gray-500 text-xs">
                       {i === 4 ? <div className="w-8 h-4 bg-green-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div> : <span>Everyone</span>}
                       {i !== 4 && <ChevronRight size={14} />}
                   </div>
                </div>
             ))}
          </div>

          <div className="mt-auto flex gap-3 pb-safe">
             <button className="flex-1 py-3 bg-brand-dark rounded-sm text-sm font-bold text-white flex items-center justify-center gap-2 hover:bg-white/10">
                <Scissors size={16} /> Drafts
             </button>
             <button onClick={handlePost} className="flex-1 py-3 bg-brand-pink rounded-sm text-sm font-bold text-white flex items-center justify-center gap-2 hover:brightness-110">
                <UploadIcon size={16} /> Post
             </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};