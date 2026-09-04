'use client';
import { useState } from 'react';
import { ShieldCheck, Clock, Lock, Unlock, Zap, Plus } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export function EscrowView() {
  const store = useAppStore();
  const escrows = store.escrows;
  const [isCreating, setIsCreating] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [daysLocked, setDaysLocked] = useState('3');

  const handleCreate = () => {
    if (!recipientName || !amount || parseFloat(amount) <= 0) return;
    store.createEscrow(parseFloat(amount), recipientName, parseInt(daysLocked));
    setRecipientName('');
    setAmount('');
    setIsCreating(false);
  };

  const handleRelease = (id: string) => {
    store.releaseEscrow(id);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-24 overflow-y-auto">
      <div className="bg-gradient-to-br from-indigo-900 to-blue-900 pt-16 pb-8 px-6 text-white shadow-xl relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 right-0 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 border border-white/20 shadow-inner">
            <ShieldCheck size={32} className="text-blue-300" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Sui Escrow</h1>
          <p className="text-blue-200 text-sm max-w-[260px] leading-relaxed">
            Time-locked smart contracts for trustless deposits and guarantees.
          </p>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20 space-y-4">
        {/* Active Escrow Summary Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/40 flex justify-between items-center">
          <div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Locked Value</div>
            <div className="text-3xl font-black text-slate-900">
              ${escrows.filter(e => e.status === 'locked').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
            </div>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2 pl-2">Your Escrows</h2>

        {escrows.map((escrow) => {
          const isLocked = escrow.status === 'locked';
          return (
            <motion.div 
              layout
              key={escrow.id}
              className={`bg-white rounded-[2rem] p-5 shadow-sm border ${isLocked ? 'border-blue-100' : 'border-slate-100'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLocked ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                    {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{escrow.recipientName}</h3>
                    <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                      <Clock size={12} />
                      <span>{isLocked ? `Unlocks ${new Date(escrow.unlockDate).toLocaleDateString()}` : 'Released'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-slate-900">${escrow.amount.toFixed(2)}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block ${isLocked ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isLocked ? 'Locked' : 'Released'}
                  </div>
                </div>
              </div>

              {isLocked && (
                <button
                  onClick={() => handleRelease(escrow.id)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-colors"
                >
                  <Zap size={16} className="fill-white" />
                  <span>Release Funds</span>
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {isCreating && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 z-[101] shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />
              <h3 className="text-2xl font-black text-slate-900 mb-6">Create Escrow</h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Recipient Name / Purpose</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g., Landlord Deposit"
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Amount ($)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Days</label>
                    <input
                      type="number"
                      value={daysLocked}
                      onChange={(e) => setDaysLocked(e.target.value)}
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!recipientName || !amount}
                className="w-full py-4 bg-blue-600 disabled:bg-blue-300 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 active:scale-95 transition-all"
              >
                <ShieldCheck size={20} />
                <span>Lock Funds in Escrow</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
