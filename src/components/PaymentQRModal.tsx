'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, Copy, Check, Share2, Sparkles, ArrowDownLeft, ShieldCheck, Zap, Scan, ArrowRight, Store, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function PaymentQRModal({
  isOpen,
  onClose,
  onRecordExpense
}: {
  isOpen: boolean;
  onClose: () => void;
  onRecordExpense?: (data: { amount: string; description: string; category: string }) => void;
}) {
  const store = useAppStore();
  const currentUser = store.currentUser;
  
  const [activeTab, setActiveTab] = useState<'receive' | 'scan'>('receive');
  
  // Receive State
  const [requestAmount, setRequestAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [receivedSuccess, setReceivedSuccess] = useState(false);

  // Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ merchant: string; rmAmount: number; usdcAmount: number; provider: string } | null>(null);
  const [payingStatus, setPayingStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  if (!currentUser) return null;

  const payLink = `https://equisettle.sui/pay/${currentUser.name.split(' ')[0].toLowerCase()}${
    requestAmount ? `?amount=${requestAmount}` : ''
  }`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(payLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateReceive = async () => {
    const amountToReceive = parseFloat(requestAmount) || 25;
    setSimulatingPayment(true);
    await new Promise(r => setTimeout(r, 1200));
    
    store.addFunds(amountToReceive);
    setSimulatingPayment(false);
    setReceivedSuccess(true);
    setTimeout(() => {
      setReceivedSuccess(false);
      onClose();
    }, 1800);
  };

  const startScan = () => {
    setScanResult(null);
    setPayingStatus('idle');
    setIsScanning(true);
    
    // Simulate camera scanning a DuitNow QR for 1.5 seconds
    setTimeout(() => {
      setIsScanning(false);
      // Randomize between Touch 'n Go and RHB
      const isTNG = Math.random() > 0.5;
      setScanResult({
        merchant: isTNG ? 'Kopitiam Ah Kau' : 'Nasi Lemak Village (RHB)',
        rmAmount: isTNG ? 15.50 : 24.80,
        usdcAmount: isTNG ? 3.52 : 5.63,
        provider: isTNG ? "Touch 'n Go eWallet" : "RHB Bank"
      });
    }, 1500);
  };

  const handleConfirmDuitNowPayment = async () => {
    if (!scanResult) return;
    setPayingStatus('processing');
    
    await new Promise(r => setTimeout(r, 1500)); // Simulate zkLogin & Sui transaction
    
    store.payDuitNow(scanResult.usdcAmount, scanResult.merchant, scanResult.provider);
    setPayingStatus('success');
  };

  const handleFinishScan = () => {
    setPayingStatus('idle');
    setScanResult(null);
    setActiveTab('receive');
    onClose();
  };

  const handleRecordExpense = () => {
    if (onRecordExpense && scanResult) {
      onRecordExpense({
        amount: scanResult.usdcAmount.toString(),
        description: scanResult.merchant,
        category: '🍔 Food'
      });
    }
    handleFinishScan();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[110]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 max-h-[92%] bg-white rounded-t-[2.5rem] shadow-2xl z-[111] p-6 flex flex-col overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />

            {/* Header */}
            <div className="flex justify-between items-center pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  {activeTab === 'receive' ? <QrCode size={18} /> : <Scan size={18} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {activeTab === 'receive' ? 'Receive & Pay QR' : 'DuitNow Scanner'}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {activeTab === 'receive' ? 'Scan with any Sui wallet' : 'Pay TNG & RHB with USDC'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
              <button
                onClick={() => setActiveTab('receive')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'receive' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Receive Crypto
              </button>
              <button
                onClick={() => { setActiveTab('scan'); startScan(); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'scan' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Scan DuitNow (MYR)
              </button>
            </div>

            {/* RECEIVE TAB */}
            {activeTab === 'receive' && (
              receivedSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 mb-4"
                  >
                    <Check size={40} strokeWidth={3} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900">Payment Received!</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    +${(parseFloat(requestAmount) || 25).toFixed(2)} USDC credited to your Sui wallet.
                  </p>
                  <div className="mt-3 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    0 Gas • Confirmed on Sui Testnet
                  </div>
                </div>
              ) : (
                <div className="space-y-5 flex flex-col items-center">
                  <div className="w-full max-w-xs bg-gradient-to-b from-slate-50 to-white p-6 rounded-[2rem] border border-slate-200/80 shadow-md text-center flex flex-col items-center">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-md mb-2">
                      <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.name}`} />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="font-bold text-base text-slate-900">{currentUser.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 mb-4 truncate max-w-[200px]">
                      {currentUser.walletAddress || '0x...sui'}
                    </div>

                    <div className="relative p-4 bg-white rounded-3xl border border-slate-200 shadow-inner flex items-center justify-center mb-3">
                      <svg className="w-44 h-44" viewBox="0 0 160 160" fill="none">
                        <rect x="10" y="10" width="40" height="40" rx="8" stroke="#1e293b" strokeWidth="8" />
                        <rect x="22" y="22" width="16" height="16" rx="3" fill="#2563eb" />
                        <rect x="110" y="10" width="40" height="40" rx="8" stroke="#1e293b" strokeWidth="8" />
                        <rect x="122" y="22" width="16" height="16" rx="3" fill="#2563eb" />
                        <rect x="10" y="110" width="40" height="40" rx="8" stroke="#1e293b" strokeWidth="8" />
                        <rect x="22" y="122" width="16" height="16" rx="3" fill="#2563eb" />
                        <circle cx="80" cy="80" r="18" fill="#2563eb" />
                        <path d="M74 80 L79 85 L87 75" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {requestAmount && (
                        <div className="absolute -bottom-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          Requesting ${parseFloat(requestAmount).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full max-w-xs">
                    <label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                      Request Specific Amount
                    </label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={requestAmount}
                        onChange={(e) => setRequestAmount(e.target.value)}
                        className="pl-8 text-base py-5 rounded-2xl bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="w-full max-w-xs space-y-2.5">
                    <Button onClick={handleCopyLink} variant="outline" className="w-full py-6 rounded-2xl border-slate-200">
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span className="ml-1.5">{copied ? 'Link Copied!' : 'Copy Payment Link'}</span>
                    </Button>

                    <Button onClick={handleSimulateReceive} disabled={simulatingPayment} className="w-full py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                      <Zap size={14} className="mr-1.5 fill-white" />
                      {simulatingPayment ? 'Processing...' : `Simulate Friend Paying`}
                    </Button>
                  </div>
                </div>
              )
            )}

            {/* SCAN TAB (DuitNow) */}
            {activeTab === 'scan' && (
              <div className="flex flex-col items-center">
                {isScanning ? (
                  <div className="w-full max-w-xs py-10 flex flex-col items-center">
                    <div className="relative w-64 h-64 bg-slate-900 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center border-4 border-slate-800">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30" />
                      <motion.div
                        animate={{ y: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_20px_4px_rgba(52,211,153,0.8)]"
                      />
                      <Scan size={48} className="text-slate-700 opacity-50" />
                      
                      {/* Corner markers */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
                    </div>
                    <p className="mt-6 font-bold text-slate-600 animate-pulse">Scanning DuitNow QR...</p>
                  </div>
                ) : payingStatus === 'success' ? (
                  <div className="w-full max-w-xs py-8 flex flex-col items-center justify-center text-center space-y-5">
                    <motion.div
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200"
                    >
                      <Check size={32} strokeWidth={3} />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Payment Successful!</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Paid RM {scanResult?.rmAmount.toFixed(2)} to {scanResult?.merchant}.
                      </p>
                      <div className="mt-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold inline-block">
                        Auto-converted from ${scanResult?.usdcAmount.toFixed(2)} USDC
                      </div>
                    </div>
                    
                    <div className="w-full space-y-2.5 pt-4">
                      {onRecordExpense && (
                        <Button
                          onClick={handleRecordExpense}
                          className="w-full py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
                        >
                          Split & Record Expense
                        </Button>
                      )}
                      <Button
                        onClick={handleFinishScan}
                        variant="outline"
                        className="w-full py-6 rounded-2xl border-slate-200 text-slate-600 font-bold text-sm"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : scanResult ? (
                  <div className="w-full max-w-xs space-y-4">
                    {/* Merchant Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-5 shadow-sm text-center">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-3 text-pink-600">
                        <Store size={24} />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                        {scanResult.merchant}
                      </h3>
                      <div className="flex items-center justify-center space-x-1.5 mt-1.5 mb-5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 bg-slate-200 rounded-full">
                          DuitNow QR
                        </span>
                        <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                          {scanResult.provider}
                        </span>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paying Amount</div>
                        <div className="text-3xl font-black text-slate-900">RM {scanResult.rmAmount.toFixed(2)}</div>
                      </div>

                      <div className="flex items-center justify-center space-x-2 text-[11px] font-semibold text-emerald-600">
                        <ArrowDownLeft size={14} />
                        <span>Est. Cost: ${scanResult.usdcAmount.toFixed(2)} USDC (0 Gas)</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleConfirmDuitNowPayment}
                      disabled={payingStatus === 'processing'}
                      className="w-full py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                    >
                      {payingStatus === 'processing' ? (
                        'Authenticating & Paying...'
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Wallet size={16} />
                          <span>Pay RM {scanResult.rmAmount.toFixed(2)} with Sui</span>
                        </div>
                      )}
                    </Button>
                    <div className="text-center">
                      <button onClick={startScan} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                        Cancel & Scan Again
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
