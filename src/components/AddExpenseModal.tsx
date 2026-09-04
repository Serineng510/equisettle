'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Check, Sparkles, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { ReceiptScannerModal, ScannedReceiptResult } from './ReceiptScannerModal';

export function AddExpenseModal({ 
  isOpen, 
  onClose, 
  groupId,
  initialAmount = '',
  initialDescription = '',
  initialCategory = '🍔 Food'
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  groupId: string,
  initialAmount?: string,
  initialDescription?: string,
  initialCategory?: string
}) {
  const [amount, setAmount] = useState(initialAmount);
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState(initialCategory);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedSummary, setScannedSummary] = useState<string | null>(null);
  
  const store = useAppStore();
  const group = store.groups.find(g => g.id === groupId);
  const currentUser = store.currentUser;
  
  const [payerId, setPayerId] = useState(currentUser?.id || '');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isSplitExpanded, setIsSplitExpanded] = useState(true);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (isOpen) {
      setAmount(initialAmount);
      setDescription(initialDescription);
      setCategory(initialCategory);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    
    if (group && isOpen) {
      setSelectedMemberIds(group.members.map(m => m.id));
      if (!payerId && currentUser?.id) {
        setPayerId(currentUser.id);
      }
      setScannedSummary(null);
    }
  }, [group, isOpen, currentUser?.id, initialAmount, initialDescription, initialCategory, payerId]);

  const handleScanComplete = (result: ScannedReceiptResult) => {
    setAmount(result.total.toFixed(2));
    setDescription(result.merchant);
    setCategory(result.category);
    setDate(result.date);
    const activeCount = selectedMemberIds.length > 0 ? selectedMemberIds.length : (group?.members.length || 1);
    const perPerson = (result.total / activeCount).toFixed(2);
    setScannedSummary(`Receipt auto-split: $${result.total.toFixed(2)} total • $${perPerson} each for ${activeCount} members`);
  };

  const toggleMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length === 1) return; // Keep at least one person
      setSelectedMemberIds(prev => prev.filter(mId => mId !== id));
    } else {
      setSelectedMemberIds(prev => [...prev, id]);
    }
  };

  const handleAdd = () => {
    if (!amount || !group || !payerId || selectedMemberIds.length === 0) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const activeMembers = group.members.filter(m => selectedMemberIds.includes(m.id));
    const splitAmount = parsedAmount / activeMembers.length;
    
    store.addExpense(groupId, {
      id: Math.random().toString(),
      payerId: payerId,
      amount: parsedAmount,
      description: description,
      category: category,
      date: date,
      participants: activeMembers.map(m => ({
        userId: m.id,
        amountOwed: splitAmount
      }))
    });
    
    setAmount('');
    setDescription('');
    setReceipt(null);
    onClose();
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
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="absolute bottom-0 left-0 right-0 h-[90%] bg-white rounded-t-3xl shadow-2xl z-[101] p-6 flex flex-col"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">New Expense</h2>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 space-y-6 overflow-y-auto">
              <div className="text-center mt-4">
                <div className="text-slate-400 mb-2 font-medium">Amount</div>
                <div className="flex items-center justify-center text-5xl font-bold">
                  <span className="text-slate-300 mr-2">$</span>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setScannedSummary(null);
                    }}
                    placeholder="0.00"
                    className="w-48 text-center outline-none bg-transparent"
                    autoFocus
                  />
                </div>

                {/* AI Scan Receipt Trigger */}
                <div className="flex justify-center mt-3">
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200/80 text-xs font-semibold shadow-xs transition-all active:scale-95"
                  >
                    <Sparkles size={13} className="text-blue-600" />
                    <span>Scan Receipt to Auto-Split ⚡</span>
                  </button>
                </div>

                {/* Scanned summary notification */}
                {scannedSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 mx-2 p-2.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs rounded-2xl flex items-center justify-center space-x-1.5 font-medium shadow-xs"
                  >
                    <Sparkles size={13} className="text-emerald-600 shrink-0" />
                    <span>{scannedSummary}</span>
                  </motion.div>
                )}
              </div>

              <div className="mt-6">
                <div className="text-sm font-medium text-slate-500 mb-3">Who paid?</div>
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  {group?.members.map(member => (
                    <button 
                      key={member.id}
                      onClick={() => setPayerId(member.id)}
                      className={`flex flex-col items-center p-2 rounded-2xl min-w-[72px] transition-all ${payerId === member.id ? 'bg-blue-50 ring-2 ring-blue-500 shadow-sm' : 'opacity-70 grayscale hover:grayscale-0'}`}
                    >
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} alt={member.name} className="w-10 h-10 rounded-full mb-1" />
                      <span className={`text-xs font-medium ${payerId === member.id ? 'text-blue-700' : 'text-slate-600'}`}>{member.id === currentUser?.id ? 'You' : member.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <Input 
                  placeholder="What was this for?" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-lg py-6 bg-slate-50 border-none rounded-xl"
                />
              </div>

              <div className="mt-6 space-y-4">
                <div className="text-sm font-medium text-slate-500 mb-2">Details</div>
                
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  {['🍔 Food', '🚗 Transport', '🏠 Housing', '✈️ Flights', '🛒 Groceries'].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${category === cat ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <div className="relative flex-1 bg-slate-50 p-4 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition-colors">
                    <span className="text-slate-600 font-medium truncate pr-2">
                      {date === new Date().toISOString().split('T')[0] ? 'Today' : new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="w-8 h-8 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    </div>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      onClick={(e) => {
                        try {
                          if ('showPicker' in HTMLInputElement.prototype) {
                            e.currentTarget.showPicker();
                          }
                        } catch (err) {}
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="flex-1 bg-slate-50 p-4 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition-colors border border-dashed border-slate-300 text-left cursor-pointer"
                  >
                    <span className="text-slate-600 font-medium truncate pr-2 text-sm">
                      {scannedSummary ? 'Receipt Scanned' : 'Scan Receipt'}
                    </span>
                    <div className="w-8 h-8 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm">
                      {scannedSummary ? (
                        <Check size={16} className="text-emerald-500" />
                      ) : (
                        <Sparkles size={15} className="text-blue-500" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-slate-500">Split Options</div>
                  <button 
                    type="button"
                    onClick={() => {
                      if (selectedMemberIds.length === group?.members.length) {
                        setSelectedMemberIds([payerId]);
                      } else {
                        setSelectedMemberIds(group?.members.map(m => m.id) || []);
                      }
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {selectedMemberIds.length === group?.members.length ? 'Deselect others' : 'Select all'}
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl mb-2 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-white rounded-xl shadow-sm text-blue-600">
                        <Users size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Split equally</div>
                        <div className="text-xs text-slate-500">
                          {selectedMemberIds.length} of {group?.members.length} people
                          {amount && selectedMemberIds.length > 0 && ` • $${(parseFloat(amount) / selectedMemberIds.length).toFixed(2)} each`}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsSplitExpanded(!isSplitExpanded)}
                      className="text-blue-600 font-medium text-xs h-8 px-2"
                    >
                      {isSplitExpanded ? 'Collapse' : 'Choose people'}
                    </Button>
                  </div>

                  {isSplitExpanded && (
                    <div className="space-y-1.5 pt-3 border-t border-slate-200/60">
                      {group?.members.map(member => {
                        const isSelected = selectedMemberIds.includes(member.id);
                        const perPersonShare = amount && selectedMemberIds.length > 0 
                          ? (parseFloat(amount) / selectedMemberIds.length).toFixed(2)
                          : '0.00';

                        return (
                          <div 
                            key={member.id}
                            onClick={() => toggleMember(member.id)}
                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer select-none transition-all ${
                              isSelected 
                                ? 'bg-white shadow-sm border border-blue-100/80' 
                                : 'bg-transparent opacity-45 hover:opacity-70'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-white transition-colors ${
                                isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check size={13} strokeWidth={3} />}
                              </div>
                              <img 
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} 
                                alt={member.name} 
                                className="w-8 h-8 rounded-full bg-slate-100" 
                              />
                              <div>
                                <span className="text-sm font-medium text-slate-800">
                                  {member.id === currentUser?.id ? 'You' : member.name}
                                </span>
                                {member.id === payerId && (
                                  <span className="ml-2 text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                                    Payer
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`text-xs font-semibold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                              {isSelected ? `$${perPersonShare}` : 'Excluded'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-between px-2 text-xs font-medium text-slate-400">
                  <button className="hover:text-slate-600">Switch to exact amounts</button>
                  <button className="hover:text-slate-600">Switch to percentages</button>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              onClick={handleAdd}
              disabled={!amount || selectedMemberIds.length === 0}
              className="w-full mt-4 py-7 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 text-lg font-medium disabled:opacity-50"
            >
              {selectedMemberIds.length === 0 ? 'Select at least 1 person' : 'Add Expense'}
            </Button>
          </motion.div>

          <ReceiptScannerModal
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onScanComplete={handleScanComplete}
          />
        </>
      )}
    </AnimatePresence>
  );
}
