import React from 'react';
import { ChevronLeft, Coins, CreditCard } from 'lucide-react';

interface WalletProps {
  currentBalance: number;
  onClose: () => void;
  onBuy: (amount: number, cost: string) => void;
}

const PACKAGES = [
  { coins: 5, cost: '$0.09' },
  { coins: 70, cost: '$0.99', popular: true },
  { coins: 350, cost: '$4.99' },
  { coins: 700, cost: '$9.99' },
  { coins: 1400, cost: '$19.99' },
  { coins: 3500, cost: '$49.99' },
  { coins: 7000, cost: '$99.99' },
  { coins: 17500, cost: '$249.99' },
];

export const Wallet: React.FC<WalletProps> = ({ currentBalance, onClose, onBuy }) => {
  return (
    <div className="absolute inset-0 z-[60] bg-brand-dark text-white flex flex-col animate-slide-right">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-white/10">
        <button onClick={onClose}><ChevronLeft size={24} /></button>
        <h1 className="flex-1 text-center font-bold text-lg">Recharge</h1>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Balance Card */}
        <div className="bg-brand-indigo p-6 flex flex-col items-center justify-center gap-2 m-4 rounded-xl shadow-lg border border-white/5">
           <span className="text-gray-400 text-sm font-medium">Total Balance</span>
           <div className="flex items-center gap-2">
              <Coins size={28} className="text-brand-gold fill-brand-gold" />
              <span className="text-4xl font-bold">{currentBalance}</span>
           </div>
        </div>

        {/* Packages */}
        <div className="px-4 py-2">
           <h2 className="font-bold mb-4 text-sm text-brand-pink uppercase tracking-wide">Coins Packages</h2>
           <div className="flex flex-col gap-2">
              {PACKAGES.map((pkg, idx) => (
                 <button 
                   key={idx}
                   onClick={() => onBuy(pkg.coins, pkg.cost)}
                   className="flex justify-between items-center p-4 border border-white/10 bg-white/5 rounded-lg active:bg-white/10 transition-colors"
                 >
                    <div className="flex items-center gap-3">
                       <Coins size={20} className="text-brand-gold fill-brand-gold" />
                       <span className="font-bold text-lg">{pkg.coins}</span>
                       {pkg.popular && (
                          <span className="bg-brand-pink text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg shadow-brand-pink/50">POPULAR</span>
                       )}
                    </div>
                    <div className="bg-brand-pink text-white px-4 py-1.5 rounded font-bold text-sm min-w-[80px] hover:brightness-110">
                       {pkg.cost}
                    </div>
                 </button>
              ))}
           </div>
        </div>
        
        <div className="px-4 pb-8 text-center text-xs text-gray-500 leading-relaxed mt-4">
           By recharging, you agree to our Terms of Use and Virtual Items Policy. 
           Purchases are non-refundable.
        </div>
      </div>
    </div>
  );
};