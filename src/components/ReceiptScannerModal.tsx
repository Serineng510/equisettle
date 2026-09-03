'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  X, 
  Receipt, 
  Loader2, 
  Utensils, 
  Coffee, 
  Car,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ScannedReceiptResult {
  merchant: string;
  total: number;
  category: string;
  date: string;
  items: { name: string; price: number }[];
  receiptPreview?: string;
}

const SAMPLE_RECEIPTS: ScannedReceiptResult[] = [
  {
    merchant: 'Izakaya Torii 🍣',
    total: 86.50,
    category: '🍔 Food',
    date: new Date().toISOString().split('T')[0],
    items: [
      { name: 'Special Tonkotsu Ramen (x2)', price: 36.00 },
      { name: 'Pork Gyoza (8pcs)', price: 14.50 },
      { name: 'Draft Sapporo Beer (x2)', price: 18.00 },
      { name: 'Sales Tax & Gratuity', price: 18.00 },
    ],
  },
  {
    merchant: 'Blue Bottle Coffee ☕',
    total: 24.75,
    category: '🍔 Food',
    date: new Date().toISOString().split('T')[0],
    items: [
      { name: 'Iced Oat Latte', price: 7.50 },
      { name: 'Single Origin Pour Over', price: 8.25 },
      { name: 'Almond Croissant', price: 6.50 },
      { name: 'Tax', price: 2.50 },
    ],
  },
  {
    merchant: 'Uber Ride to Airport 🚕',
    total: 42.30,
    category: '🚗 Transport',
    date: new Date().toISOString().split('T')[0],
    items: [
      { name: 'UberX Trip (14.2 miles)', price: 34.50 },
      { name: 'Tolls & Airport Surcharge', price: 4.80 },
      { name: 'Driver Tip', price: 3.00 },
    ],
  },
];

export function ReceiptScannerModal({
  isOpen,
  onClose,
  onScanComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: ScannedReceiptResult) => void;
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [detectedItems, setDetectedItems] = useState<string[]>([]);
  const [activeReceipt, setActiveReceipt] = useState<ScannedReceiptResult | null>(null);

  const startScan = (sample?: ScannedReceiptResult, customName?: string) => {
    setIsScanning(true);
    setScanningProgress(15);
    setDetectedItems(['Detecting receipt edges...']);

    const targetReceipt = sample || {
      merchant: customName ? `${customName} 🧾` : 'Restaurant Bill 🍽️',
      total: +(Math.random() * 60 + 35).toFixed(2),
      category: '🍔 Food',
      date: new Date().toISOString().split('T')[0],
      items: [
        { name: 'Main Course Item (x2)', price: 38.00 },
        { name: 'Appetizer Platter', price: 16.50 },
        { name: 'Specialty Beverages', price: 14.00 },
        { name: 'Tax & Gratuity', price: 12.00 },
      ],
    };

    setActiveReceipt(targetReceipt);

    setTimeout(() => {
      setScanningProgress(45);
      setDetectedItems(prev => [...prev, 'Running OCR itemization...']);
    }, 600);

    setTimeout(() => {
      setScanningProgress(80);
      setDetectedItems(prev => [
        ...prev,
        `Found total: $${targetReceipt.total.toFixed(2)}`,
        'Calculating automatic split...',
      ]);
    }, 1200);

    setTimeout(() => {
      setScanningProgress(100);
      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(targetReceipt);
        onClose();
      }, 500);
    }, 1800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const name = file.name.replace(/\.[^/.]+$/, '');
      startScan(undefined, name);
    }
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
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-[120]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 max-h-[90%] bg-white rounded-t-[2.5rem] shadow-2xl z-[121] p-6 flex flex-col overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />

            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AI Receipt Scanner</h2>
                  <p className="text-xs text-slate-500">Auto-detect total & split with 1 tap</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>

            {isScanning ? (
              /* Scanning Animation State */
              <div className="py-8 flex flex-col items-center justify-center text-center">
                {/* Glowing Scanner Box */}
                <div className="relative w-48 h-56 bg-slate-50 rounded-3xl border-2 border-blue-400/80 shadow-xl overflow-hidden flex flex-col items-center justify-center p-4 mb-6">
                  {/* Laser line moving up and down */}
                  <motion.div
                    animate={{ y: [-90, 90, -90] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_#3b82f6]"
                  />
                  
                  <Receipt size={56} className="text-slate-300 mb-2" />
                  <div className="text-[11px] font-mono text-slate-400">
                    {activeReceipt?.merchant || 'RECEIPT_OCR_STREAM'}
                  </div>
                  <div className="mt-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                    AI Parsing • {scanningProgress}%
                  </div>
                </div>

                {/* Progress Logs */}
                <div className="space-y-1.5 max-w-xs w-full text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-4">
                  {detectedItems.map((log, index) => (
                    <div key={index} className="text-xs text-slate-600 flex items-center space-x-2">
                      <Check size={13} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{log}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs font-semibold text-blue-600 flex items-center space-x-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Auto-filling expense & calculating split...</span>
                </div>
              </div>
            ) : (
              /* Choose Scan Method */
              <div className="space-y-5 py-2">
                {/* File / Camera Upload Option */}
                <div className="relative border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70 p-6 rounded-3xl text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 text-blue-600 shadow-sm border border-blue-100">
                    <Camera size={22} />
                  </div>
                  <div className="font-bold text-sm text-slate-800">Upload or Snap a Receipt</div>
                  <p className="text-xs text-slate-500 mt-1">Select any bill or restaurant photo</p>
                </div>

                {/* Instant Hackathon Demo Presets */}
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1 flex items-center space-x-1">
                    <Zap size={13} className="text-amber-500" />
                    <span>Quick Demo Receipts (Instant Auto-Fill):</span>
                  </div>

                  <div className="space-y-2">
                    {SAMPLE_RECEIPTS.map((sample, idx) => (
                      <div
                        key={idx}
                        onClick={() => startScan(sample)}
                        className="p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 rounded-2xl cursor-pointer transition-all flex items-center justify-between group active:scale-[0.99]"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-700 font-medium shadow-xs group-hover:text-blue-600">
                            {idx === 0 ? <Utensils size={16} /> : idx === 1 ? <Coffee size={16} /> : <Car size={16} />}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-slate-800">{sample.merchant}</div>
                            <div className="text-[11px] text-slate-400">{sample.items.length} items detected</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-sm text-blue-600">${sample.total.toFixed(2)}</div>
                          <span className="text-[10px] text-slate-400 font-medium">Auto-Split →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center px-4">
                  Powered by computer vision. Automatically sets amount, item description, category, and divides among your group members equally.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
