'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, AlignLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ExpenseDetailsModal({ 
  isOpen, 
  onClose, 
  expenseId, 
  groupId 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  expenseId: string | null,
  groupId: string 
}) {
  const store = useAppStore();
  const group = store.groups.find(g => g.id === groupId);
  const expense = group?.expenses.find(e => e.id === expenseId);
  const payer = group?.members.find(m => m.id === expense?.payerId);

  if (!expense || !group) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[100]"
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
            className="absolute bottom-0 left-0 right-0 h-[80%] bg-slate-50 rounded-t-3xl shadow-2xl z-[101] p-6 flex flex-col"
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-6 shrink-0" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                <span className="text-sm font-medium text-slate-700">{expense.category || '🛒 General'}</span>
              </div>
              <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-500 hover:bg-slate-100 shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pb-20">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">${expense.amount.toFixed(2)}</div>
                <div className="text-lg font-medium text-slate-600">{expense.description || 'Untitled Expense'}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4 mt-6">
                <div className="flex items-center space-x-3 text-slate-600">
                  <Calendar size={18} className="text-blue-500" />
                  <span className="font-medium text-sm">
                    {expense.date 
                      ? new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Today'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600">
                  <AlignLeft size={18} className="text-emerald-500" />
                  <span className="font-medium text-sm">Added by {payer?.name || 'Someone'}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-2">Split Details</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  {expense.participants.map((p, index) => {
                    const participant = group.members.find(m => m.id === p.userId);
                    return (
                      <div key={p.userId}>
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${participant?.name}`} />
                              <AvatarFallback>{participant?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{participant?.name}</span>
                          </div>
                          <span className="font-semibold text-slate-700">${p.amountOwed.toFixed(2)}</span>
                        </div>
                        {index < expense.participants.length - 1 && <div className="h-px bg-slate-50 mx-4" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
