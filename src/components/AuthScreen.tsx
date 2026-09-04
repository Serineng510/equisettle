'use client';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    // Simulate zkLogin flow
    await new Promise(r => setTimeout(r, 1500));
    onLogin();
  };

  return (
    <div className="absolute inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-blue-200 rotate-3">
          <Zap size={48} className="text-white fill-white -rotate-3" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">EquiSettle</h1>
        <p className="text-slate-500 mb-12 text-lg">
          Web3 expense splitting & escrows, without the crypto complexity.
        </p>

        <div className="space-y-4 mb-12">
          <div className="flex items-center space-x-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <ShieldCheck size={24} className="text-emerald-500 shrink-0" />
            <div>
              <div className="font-bold text-slate-900 text-sm">100% Self-Custodial</div>
              <div className="text-xs text-slate-500">You control your funds, no banks involved.</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <Wallet size={24} className="text-blue-500 shrink-0" />
            <div>
              <div className="font-bold text-slate-900 text-sm">0 Browser Extensions</div>
              <div className="text-xs text-slate-500">Powered natively by Sui zkLogin.</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-5 rounded-[2rem] shadow-xl shadow-slate-300 flex items-center justify-center space-x-3 active:scale-95 transition-all"
        >
          {isLoggingIn ? (
            <div className="w-6 h-6 border-4 border-slate-400 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>
        <p className="mt-4 text-[11px] text-slate-400">
          Powered by Sui zkLogin cryptography
        </p>
      </motion.div>
    </div>
  );
}
