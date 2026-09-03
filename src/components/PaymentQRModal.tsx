'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, Copy, Check, Share2, Sparkles, ArrowDownLeft, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function PaymentQRModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const store = useAppStore();
  const currentUser = store.currentUser;
  const [requestAmount, setRequestAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [receivedSuccess, setReceivedSuccess] = useState(false);

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
    
    // Credit funds
    store.addFunds(amountToReceive);
    setSimulatingPayment(false);
    setReceivedSuccess(true);
    setTimeout(() => {
      setReceivedSuccess(false);
      onClose();
    }, 1800);
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
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-[110]"
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
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <QrCode size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Receive & Pay QR</h2>
                  <p className="text-xs text-slate-500">Scan with any Sui wallet to pay</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>

            {receivedSuccess ? (
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
                {/* QR Card Container */}
                <div className="w-full max-w-xs bg-gradient-to-b from-slate-50 to-white p-6 rounded-[2rem] border border-slate-200/80 shadow-md text-center flex flex-col items-center">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-md mb-2">
                    <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.name}`} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="font-bold text-base text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] font-mono text-slate-400 mb-4 truncate max-w-[200px]">
                    {currentUser.walletAddress || '0x...sui'}
                  </div>

                  {/* High Quality Geometric QR Mock */}
                  <div className="relative p-4 bg-white rounded-3xl border border-slate-200 shadow-inner flex items-center justify-center mb-3">
                    <svg className="w-44 h-44" viewBox="0 0 160 160" fill="none">
                      {/* Corner Position Detection Squares */}
                      <rect x="10" y="10" width="40" height="40" rx="8" stroke="#1e293b" strokeWidth="8" />
                      <rect x="22" y="22" width="16" height="16" rx="3" fill="#2563eb" />
                      <rect x="110" y="10" width="40" height="40" rx="8" stroke="#1e293b" strokeWidth="8" />
                      <rect x="122" y="22" width="16" height="16" rx="3" fill="#2563eb" />
                      <rect x="10" y="110" width="40" height="40" rx="8" stroke="#1e293b" strokeWidth="8" />
                      <rect x="22" y="122" width="16" height="16" rx="3" fill="#2563eb" />
                      
                      {/* Data Pattern Grid */}
                      <rect x="65" y="15" width="10" height="10" rx="2" fill="#1e293b" />
                      <rect x="85" y="20" width="10" height="10" rx="2" fill="#1e293b" />
                      <rect x="60" y="35" width="12" height="12" rx="2" fill="#1e293b" />
                      <rect x="80" y="45" width="10" height="10" rx="2" fill="#1e293b" />
                      <rect x="15" y="65" width="10" height="10" rx="2" fill="#1e293b" />
                      <rect x="35" y="70" width="12" height="12" rx="2" fill="#1e293b" />
                      <rect x="15" y="85" width="10" height="10" rx="2" fill="#1e293b" />
                      <rect x="115" y="65" width="10" height="10" rx="2" fill="#1e293b" />
                      <rect x="135" y="85" width="10" height="10" rx="2" fill="#1e293b" />
                      <rect x="65" y="115" width="10" height="10" rx="2" fill="#1e293b" />
                      <rect x="85" y="130" width="12" height="12" rx="2" fill="#1e293b" />
                      <rect x="120" y="120" width="10" height="10" rx="2" fill="#1e293b" />
                      <rect x="135" y="135" width="10" height="10" rx="2" fill="#1e293b" />
                      
                      {/* Center Brand Badge */}
                      <circle cx="80" cy="80" r="18" fill="#2563eb" />
                      <path d="M74 80 L79 85 L87 75" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    {requestAmount && (
                      <div className="absolute -bottom-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        Requesting ${parseFloat(requestAmount).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-slate-500 text-[11px] font-medium mt-2">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>Sui zkLogin Verified • 0 Gas Fees</span>
                  </div>
                </div>

                {/* Amount Input for Custom Request */}
                <div className="w-full max-w-xs">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                    Request Specific Amount (Optional)
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

                {/* Action Buttons */}
                <div className="w-full max-w-xs space-y-2.5">
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="w-full py-6 rounded-2xl border-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center space-x-1.5"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copied ? 'Link Copied!' : 'Copy Payment Link'}</span>
                  </Button>

                  {/* Hackathon Pitch Feature: Simulate Friend Paying on the fly */}
                  <Button
                    onClick={handleSimulateReceive}
                    disabled={simulatingPayment}
                    className="w-full py-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs shadow-md shadow-blue-200 flex items-center justify-center space-x-2"
                  >
                    <Zap size={14} className="fill-white" />
                    <span>
                      {simulatingPayment
                        ? 'Simulating incoming Sui payment...'
                        : `Simulate Friend Paying ($${requestAmount ? parseFloat(requestAmount).toFixed(2) : '25.00'})`}
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
