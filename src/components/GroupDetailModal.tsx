'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Plus, ArrowUpRight, ArrowDownLeft, ChevronRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { SettleUpButton } from './SettleUpButton';
import { AddExpenseModal } from './AddExpenseModal';
import { ExpenseDetailsModal } from './ExpenseDetailsModal';

export function GroupDetailModal({
  isOpen,
  onClose,
  groupId,
}: {
  isOpen: boolean;
  onClose: () => void;
  groupId: string | null;
}) {
  const store = useAppStore();
  const currentUser = store.currentUser;
  const group = store.groups.find(g => g.id === groupId);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

  if (!group) return null;

  const totalSpend = group.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const settlements = store.getSettlements(group.id);
  const myDebt = settlements
    .filter(s => s.from === currentUser?.id)
    .reduce((sum, s) => sum + s.amount, 0);
  const myCredit = settlements
    .filter(s => s.to === currentUser?.id)
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 h-[92%] bg-slate-50 rounded-t-[2.5rem] shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 shrink-0" />

            {/* Header */}
            <div className="px-6 pb-4 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{group.name}</h2>
                  <p className="text-xs text-slate-500">{group.members.length} members • ${totalSpend.toFixed(2)} total spent</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
              <ScrollArea className="h-full px-6 pt-4">
                <div className="space-y-6 pb-24">
                  
                  {/* Balance Status Banner */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase">Your Balance</div>
                      <div className="text-lg font-bold mt-0.5">
                        {myDebt > 0 ? (
                          <span className="text-rose-500">You owe ${myDebt.toFixed(2)}</span>
                        ) : myCredit > 0 ? (
                          <span className="text-emerald-500">You're owed ${myCredit.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-700">All settled up! 🎉</span>
                        )}
                      </div>
                    </div>
                    {myDebt > 0 && (
                      <div className="w-36">
                        <SettleUpButton groupId={group.id} />
                      </div>
                    )}
                  </div>

                  {/* Group Members & Net Positions */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
                      Group Members ({group.members.length})
                    </h3>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                      {group.members.map(member => {
                        const isYou = member.id === currentUser?.id;
                        return (
                          <div key={member.id} className="flex items-center justify-between p-3.5">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-semibold text-slate-800">
                                  {member.name} {isYou && '(You)'}
                                </div>
                                <div className="text-[11px] font-mono text-slate-400">
                                  {member.walletAddress ? `${member.walletAddress.slice(0, 6)}...${member.walletAddress.slice(-4)}` : 'Sui Wallet'}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-100">
                              Member
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Group Expenses Feed */}
                  <div>
                    <div className="flex justify-between items-center mb-2.5 ml-1">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Expenses ({group.expenses.length})
                      </h3>
                      <button
                        onClick={() => setIsAddExpenseOpen(true)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      >
                        <Plus size={14} />
                        <span>Add Expense</span>
                      </button>
                    </div>

                    {group.expenses.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
                        <div className="text-sm font-semibold text-slate-700 mb-1">No expenses yet</div>
                        <p className="text-xs text-slate-400 mb-4">Log the first group bill to start splitting!</p>
                        <Button 
                          onClick={() => setIsAddExpenseOpen(true)}
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl"
                        >
                          <Plus size={14} className="mr-1" /> Add Group Expense
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {group.expenses.map(exp => {
                          const payer = group.members.find(m => m.id === exp.payerId);
                          const isSettlement = exp.category === '⚡ Settlement';

                          return (
                            <div
                              key={exp.id}
                              onClick={() => setSelectedExpenseId(exp.id)}
                              className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm cursor-pointer transition-all ${
                                isSettlement 
                                  ? 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50' 
                                  : 'bg-white border-slate-100 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${payer?.name}`} />
                                  <AvatarFallback>{payer?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-sm text-slate-800">
                                    {exp.description || `${payer?.name} paid`}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {isSettlement ? '⚡ On-Chain Sui PTB Settlement' : exp.category || 'Shared Bill'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`font-bold text-sm ${isSettlement ? 'text-emerald-600' : 'text-slate-900'}`}>
                                  ${exp.amount.toFixed(2)}
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </ScrollArea>
            </div>

            {/* Sub-Modals */}
            <AddExpenseModal
              isOpen={isAddExpenseOpen}
              onClose={() => setIsAddExpenseOpen(false)}
              groupId={group.id}
            />

            <ExpenseDetailsModal
              isOpen={!!selectedExpenseId}
              onClose={() => setSelectedExpenseId(null)}
              expenseId={selectedExpenseId}
              groupId={group.id}
            />

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
