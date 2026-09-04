'use client';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Wallet, ShieldCheck, LogOut, ArrowUpRight, ArrowDownLeft, ExternalLink, Copy, Check, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { simulateZkLogin } from '@/lib/sui/zklogin';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';

export function WalletView() {
  const account = useCurrentAccount();
  const store = useAppStore();
  const [mockAddress, setMockAddress] = useState<string | null>('0x7e3f892a4b1c5d0e729a8f...testnet');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'SUI' | 'AUSD'>('USDC');
  const [copied, setCopied] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const { simulatedAddress } = await simulateZkLogin();
      await new Promise(res => setTimeout(res, 1200));
      setMockAddress(simulatedAddress);
      if (store.walletBalance === 0) store.addFunds(100);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleTopUp = async (amount = 50) => {
    setIsToppingUp(true);
    await new Promise(res => setTimeout(res, 700));
    store.addFunds(amount);
    setIsToppingUp(false);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(address || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const address = account?.address || mockAddress;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-16">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white rounded-b-3xl shadow-sm z-10 relative">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-slate-500 text-sm mt-0.5">Sui zkLogin • Zero-gas sponsored account</p>
      </div>

      <div className="flex-1 overflow-hidden relative z-0">
        <ScrollArea className="h-full px-6 pt-6">
          <div className="space-y-6 mb-24">
            {address ? (
              <>
                {/* Main Card */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-200/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Wallet size={130} />
                  </div>

                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center space-x-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100">
                      <ShieldCheck size={14} className="text-emerald-300" />
                      <span>zkLogin Secured</span>
                    </div>
                    <div className="flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-semibold border border-emerald-400/30">
                      <Zap size={11} />
                      <span>Gas Sponsored</span>
                    </div>
                  </div>

                  <div className="relative z-10 mb-5">
                    <div className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">
                      Available Balance
                    </div>
                    <div className="text-4xl font-extrabold tracking-tight">
                      ${store.walletBalance.toFixed(2)}{' '}
                      <span className="text-lg font-semibold opacity-80 text-blue-200">USDC</span>
                    </div>
                  </div>

                  {/* Address Badge */}
                  <div className="relative z-10 flex items-center justify-between bg-black/25 px-3.5 py-2 rounded-xl backdrop-blur-md text-xs font-mono border border-white/10">
                    <span className="truncate pr-2">{address.slice(0, 10)}...{address.slice(-6)}</span>
                    <button onClick={handleCopy} className="text-blue-200 hover:text-white shrink-0">
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Token Switcher */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    Your Assets
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-xs">
                      <div className="text-xs font-semibold text-blue-600">USDC</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">${store.walletBalance.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Primary Stablecoin</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                      <div className="text-xs font-semibold text-slate-600">SUI</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">12.50</div>
                      <div className="text-[10px] text-emerald-600 font-medium mt-0.5">0 Gas Used</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                      <div className="text-xs font-semibold text-slate-600">AUSD</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">$0.00</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Supported</div>
                    </div>
                  </div>
                </div>

                {/* Quick Faucet Top Up Controls */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="font-semibold text-sm text-slate-800">Testnet USDC Faucet</div>
                      <p className="text-xs text-slate-400">Add credits instantly to test settlements</p>
                    </div>
                    <Sparkles size={18} className="text-blue-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleTopUp(25)}
                      disabled={isToppingUp}
                      className="rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold shadow-none border border-blue-100"
                    >
                      + $25
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleTopUp(50)}
                      disabled={isToppingUp}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                    >
                      {isToppingUp ? 'Minting...' : '+ $50'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleTopUp(100)}
                      disabled={isToppingUp}
                      className="rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold shadow-none border border-blue-100"
                    >
                      + $100
                    </Button>
                  </div>
                </div>

                {/* Recent Wallet & Settlement Activity */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
                    On-Chain Activity
                  </h3>
                  <div className="space-y-2.5">
                    {store.walletTransactions.map(tx => {
                      const isTopUp = tx.type === 'topup';
                      return (
                        <div
                          key={tx.id}
                          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isTopUp ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {isTopUp ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-slate-800">{tx.title}</div>
                              <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                                <span className="font-semibold text-emerald-600">0 Gas (Sponsored)</span>
                                <span>•</span>
                                <span>{new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-sm ${isTopUp ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {isTopUp ? '+' : '-'}${tx.amount.toFixed(2)}
                            </div>
                            {tx.txDigest && (
                              <a
                                href={`https://suiscan.xyz/testnet/tx/${tx.txDigest}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-600 hover:underline flex items-center justify-end space-x-0.5 mt-0.5"
                              >
                                <span>SuiScan</span>
                                <ExternalLink size={9} />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Disconnect Option */}
                <Button 
                  variant="outline" 
                  className="w-full py-6 rounded-2xl text-rose-500 hover:text-rose-600 border-rose-100 hover:bg-rose-50 font-medium"
                  onClick={() => setMockAddress(null)}
                >
                  <LogOut size={16} className="mr-2" /> Disconnect Session
                </Button>
              </>
            ) : (
              /* Connect Screen */
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
                  <Wallet size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Connect to Settle</h2>
                <p className="text-slate-500 mb-8 max-w-xs text-sm leading-relaxed">
                  Sign in with Google to create a secure Sui wallet instantly with zkLogin. No seed phrases, no gas tokens needed.
                </p>
                <Button 
                  size="lg" 
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full py-7 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 text-base font-medium"
                >
                  {isLoggingIn ? 'Verifying with Google...' : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
