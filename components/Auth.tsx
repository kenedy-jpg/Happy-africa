import React, { useState } from 'react';
import { Mail, Smartphone, Facebook, Chrome, X, User, Loader, Check, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user?: UserType) => void;
  onClose: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onClose }) => {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'method' | 'form' | 'username'>('method');
  const [isLoading, setIsLoading] = useState(false);
  
  // Registration State
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tempUser, setTempUser] = useState<Partial<UserType> | null>(null);

  // Login Methods Configuration
  const methods = [
    { icon: User, text: 'Use phone / email / username', onClick: () => setStep('form') },
    { icon: Facebook, text: 'Continue with Facebook', onClick: () => handleSocialLogin('Facebook'), color: 'text-blue-500' },
    { icon: Chrome, text: 'Continue with Google', onClick: () => handleSocialLogin('Google'), color: 'text-red-500' },
  ];

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    // Simulate API Delay
    setTimeout(() => {
        setIsLoading(false);
        setTempUser({
            id: `u_${Date.now()}`,
            avatarUrl: `https://ui-avatars.com/api/?name=${provider}+User&background=random&color=fff`,
            displayName: `${provider} User`,
            coins: 100 // Sign up bonus
        });
        setDisplayName(`${provider} User`); // Pre-fill
        setStep('username');
    }, 1500);
  };

  const handleCompleteSignup = () => {
    if (!username.trim()) return;
    
    const finalUser: UserType = {
        id: tempUser?.id || `u_${Date.now()}`,
        username: username.replace('@', '').trim().toLowerCase(),
        displayName: displayName || 'Happy User',
        avatarUrl: tempUser?.avatarUrl || 'https://picsum.photos/100/100',
        followers: 0,
        following: 0,
        likes: 0,
        coins: 100,
        bio: 'New to Happy Africa! 🌍'
    };
    
    onLogin(finalUser);
  };

  const handleStandardLogin = () => {
     // Simulate standard login returning default user
     onLogin(); 
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center text-black animate-slide-up">
      {/* Header */}
      <div className="w-full p-4 flex justify-between items-center">
        <button onClick={onClose} disabled={isLoading}>
            <X className="w-6 h-6 text-black" />
        </button>
        <div className="flex gap-1">
             <span className="text-gray-400 font-bold opacity-50">?</span>
        </div>
      </div>

      <div className="flex-1 w-full max-w-md px-8 flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-4 text-center text-brand-indigo">
            {step === 'username' ? 'Create Profile' : 'Log in to Happy Africa'}
        </h1>
        <p className="text-gray-400 mb-8 text-center text-sm">
            {step === 'username' 
                ? 'Choose how you appear to others.' 
                : 'Manage your account, check notifications, comment on videos, and more.'
            }
        </p>

        {isLoading ? (
            <div className="flex flex-col items-center gap-4">
                <Loader className="animate-spin text-brand-pink" size={40} />
                <p className="text-sm font-bold text-gray-500">Connecting...</p>
            </div>
        ) : (
            <>
                {step === 'method' && (
                <div className="w-full flex flex-col gap-3">
                    {methods.map((m, idx) => (
                    <button 
                        key={idx} 
                        onClick={m.onClick}
                        className="w-full py-3 border border-gray-300 rounded-sm flex items-center justify-center relative active:bg-gray-100 transition-colors"
                    >
                        <div className={`absolute left-4 ${m.color || 'text-black'}`}>
                        <m.icon size={20} fill={m.color ? "currentColor" : "none"} />
                        </div>
                        <span className="font-semibold text-sm">{m.text}</span>
                    </button>
                    ))}
                </div>
                )}

                {step === 'form' && (
                <div className="w-full animate-slide-right">
                    <div className="flex w-full mb-6 border-b border-gray-200">
                    <button 
                        onClick={() => setMethod('phone')} 
                        className={`flex-1 py-2 text-sm font-bold uppercase ${method === 'phone' ? 'border-b-2 border-brand-pink text-brand-pink' : 'text-gray-400'}`}
                    >
                        Phone
                    </button>
                    <button 
                        onClick={() => setMethod('email')} 
                        className={`flex-1 py-2 text-sm font-bold uppercase ${method === 'email' ? 'border-b-2 border-brand-pink text-brand-pink' : 'text-gray-400'}`}
                    >
                        Email / Username
                    </button>
                    </div>

                    {method === 'phone' ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            <div className="w-20 border border-gray-300 rounded bg-gray-50 flex items-center justify-center text-sm font-bold">
                                KE +254
                            </div>
                            <input 
                            className="flex-1 bg-gray-50 border border-gray-300 rounded p-3 outline-none focus:bg-gray-100"
                            placeholder="Phone number"
                            type="tel"
                            />
                        </div>
                        <div className="flex gap-2">
                            <input 
                            className="flex-1 bg-gray-50 border border-gray-300 rounded p-3 outline-none focus:bg-gray-100"
                            placeholder="Enter 6-digit code"
                            type="number"
                            />
                            <button className="text-gray-400 font-bold text-sm px-2 disabled:opacity-50" disabled>Send code</button>
                        </div>
                    </div>
                    ) : (
                    <div className="flex flex-col gap-4">
                        <input 
                            className="flex-1 bg-gray-50 border border-gray-300 rounded p-3 outline-none focus:bg-gray-100"
                            placeholder="Email or Username"
                            type="text"
                        />
                        <input 
                            className="flex-1 bg-gray-50 border border-gray-300 rounded p-3 outline-none focus:bg-gray-100"
                            placeholder="Password"
                            type="password"
                        />
                        <a href="#" className="text-xs font-bold text-gray-500 hover:underline">Forgot password?</a>
                    </div>
                    )}

                    <button 
                    onClick={handleStandardLogin}
                    className="w-full bg-brand-pink text-white font-bold py-3.5 rounded mt-6 active:scale-[0.98] transition-transform shadow-lg shadow-brand-pink/30 hover:brightness-105"
                    >
                    Log in
                    </button>
                </div>
                )}

                {step === 'username' && (
                    <div className="w-full animate-slide-right flex flex-col gap-4">
                        <div className="flex justify-center mb-4">
                            <img 
                                src={tempUser?.avatarUrl} 
                                className="w-20 h-20 rounded-full border-4 border-gray-100" 
                                alt="Avatar"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Username</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3.5 text-gray-400 font-bold">@</span>
                                <input 
                                    className="w-full bg-gray-50 border border-gray-300 rounded p-3 pl-8 outline-none focus:border-brand-pink focus:bg-white"
                                    placeholder="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                                    autoFocus
                                />
                                {username.length > 3 && (
                                    <div className="absolute right-3 top-3.5 text-green-500">
                                        <Check size={20} />
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Unique ID used for searching and tagging.</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Display Name</label>
                            <input 
                                className="w-full bg-gray-50 border border-gray-300 rounded p-3 outline-none focus:border-brand-pink focus:bg-white"
                                placeholder="Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </div>

                        <button 
                            onClick={handleCompleteSignup}
                            disabled={username.length < 3}
                            className="w-full bg-brand-pink text-white font-bold py-3.5 rounded mt-4 active:scale-[0.98] transition-transform shadow-lg shadow-brand-pink/30 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Start Watching <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </>
        )}
      </div>

      <div className="w-full p-6 border-t border-gray-200 text-center">
        {step !== 'username' && (
            <p className="text-sm">Don't have an account? <span className="text-brand-pink font-bold cursor-pointer" onClick={() => setStep('form')}>Sign up</span></p>
        )}
      </div>
      
      <div className="bg-gray-100 w-full py-2 text-center text-xs text-gray-500">
         By continuing, you agree to our Terms of Service and Privacy Policy.
      </div>
    </div>
  );
};