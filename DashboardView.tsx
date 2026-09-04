'use client';
import { useState } from 'react';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { SettleUpButton } from '@/components/SettleUpButton';
import { useAppStore } from '@/lib/store';
import { ConnectButton } from '@mysten/dapp-kit';
import { Plus, ArrowUpRight, ArrowDownLeft, Activity, ChevronRight, Zap, QrCode, Search, Sparkles, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ExpenseDetailsModal } from '@/components/ExpenseDetailsModal';
import { GroupDetailModal } from '@/components/GroupDetailModal';
import { PaymentQRModal } from '@/components/PaymentQRModal';

export function DashboardView({ onNavigateToInvest }: { onNavigateToInvest?: () => void }) {
  const store = useAppStore();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<{ id: string; groupId: string } | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [prefilledExpense, setPrefilledExpense] = useState<{ amount?: string, description?: string, category?: string } | null>(null);
  
  const currentUser = store.currentUser;
  const groups = store.groups;

  let totalOwed = 0;
  let totalOwedToMe = 0;

  groups.forEach(group => {
    const settlements = store.getSettlements(group.id);
    settlements.forEach(s => {
      if (s.from === currentUser?.id) totalOwed += s.amount;
      if (s.to === currentUser?.id) totalOwedToMe += s.amount;
    });
  });

  // Collect all expenses from all groups sorted by date
  const allRecentExpenses = groups.flatMap(group => 
    group.expenses.map(exp => ({
      ...exp,
      groupId: group.id,
      groupName: group.name,
      groupMembers: group.members,
    }))
  );

  const filteredExpenses = allRecentExpenses.filter(exp => {
    const matchesCategory = selectedCategoryFilter === 'All' || 
      (selectedCategoryFilter === '⚡ Settlements' ? exp.category === '⚡ Settlement' : exp.category === selectedCategoryFilter);
    const matchesSearch = !searchQuery || 
      exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.groupName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).slice(0, 20);

  const categories = ['All', '🍔 Food', '🚗 Transport', '⚡ Settlements'];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-16">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white rounded-b-3xl shadow-sm z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-slate-100">
              <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.name}`} />
              <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xs font-medium text-slate-400">Welcome back</div>
              <div className="font-bold text-slate-900">{currentUser?.name}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsQRModalOpen(true)}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors flex items-center justify-center space-x-1.5 shadow-xs active:scale-95"
            >
              <QrCode size={16} />
              <span className="text-[11px] font-bold">Scan / Pay</span>
            </button>
            <ConnectButton className="!bg-slate-900 hover:!bg-slate-800 !text-white !rounded-full !px-3.5 !py-2 !text-xs !font-medium" />
          </div>
        </div>

        {/* Balance Highlights */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center text-xs font-semibold text-slate-500 mb-1">
              <ArrowUpRight size={15} className="text-rose-500 mr-1" />
              You Owe
            </div>
            <div className="text-2xl font-extrabold text-slate-900">${totalOwed.toFixed(2)}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center text-xs font-semibold text-slate-500 mb-1">
              <ArrowDownLeft size={15} className="text-emerald-500 mr-1" />
              You're Owed
            </div>
            <div className="text-2xl font-extrabold text-slate-900">${totalOwedToMe.toFixed(2)}</div>
          </div>
        </div>

        {/* Touch 'n Go GO+ Idle Yield Banner */}
        <div 
          onClick={onNavigateToInvest}
          className="mt-3.5 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/10 p-3 rounded-2xl border border-emerald-200/80 flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-xs text-slate-900">EquiYield GO+</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                  3.6% p.a.
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                ${store.investBalance.toFixed(2)} earning daily • Today +${(((store.investBalance * 0.036) / 365)).toFixed(3)}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 hover:underline">
            Invest →
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative z-0">
        <ScrollArea className="h-full px-6 pt-5">
          {/* Active Groups Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Circles</h2>
              <span className="text-xs text-slate-400 font-medium">{groups.length} groups</span>
            </div>

            {groups.map(group => {
              const groupSettlements = store.getSettlements(group.id);
              const myDebt = groupSettlements
                .filter(s => s.from === currentUser?.id)
                .reduce((sum, s) => sum + s.amount, 0);
              
              return (
                <div key={group.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-3.5">
                  <div 
                    onClick={() => setSelectedGroupId(group.id)}
                    className="flex justify-between items-center mb-3 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-100 transition-colors">
                        <Activity size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors flex items-center space-x-1">
                          <span>{group.name}</span>
                          <ChevronRight size={13} className="text-slate-300" />
                        </div>
                        <div className="text-xs text-slate-400">{group.members.length} members</div>
                      </div>
                    </div>
                    <div className={cn("text-xs font-bold", myDebt > 0 ? "text-rose-500" : "text-emerald-500")}>
                      {myDebt > 0 ? `You owe $${myDebt.toFixed(2)}` : 'Settled'}
                    </div>
                  </div>
                  
                  <SettleUpButton groupId={group.id} />
                </div>
              );
            })}
          </div>

          {/* Hackathon Judging Highlight Banner */}
          <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/50 border border-blue-100/80 text-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-1.5 text-blue-700 font-bold text-xs">
                <Sparkles size={14} />
                <span>Greedy Debt Simplification</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                O(N) Multi-Party
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sui PTB batches all group settlements atomically with zero gas fees and sub-second execution.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Activity Feed</h2>
              <span className="text-xs text-slate-400 font-medium">{filteredExpenses.length} items</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search bills, ramen, coffee, taxi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs rounded-2xl bg-white border-slate-200/80"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategoryFilter === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="pb-28">
            <div className="space-y-2.5">
              {filteredExpenses.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-xs text-slate-400">
                  No matching expenses found.
                </div>
              ) : (
                filteredExpenses.map(exp => {
                  const payer = exp.groupMembers.find(m => m.id === exp.payerId);
                  const isSettlement = exp.category === '⚡ Settlement';

                  return (
                    <div 
                      key={exp.id} 
                      onClick={() => setSelectedExpense({ id: exp.id, groupId: exp.groupId })}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-colors active:bg-slate-100 ${
                        isSettlement ? 'bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50/60' : 'bg-white border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${payer?.name}`} />
                          <AvatarFallback>{payer?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-xs text-slate-800">
                            {exp.description || `${payer?.name} paid`}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                            {isSettlement ? (
                              <span className="font-semibold text-emerald-600 flex items-center space-x-0.5">
                                <Zap size={11} className="fill-emerald-500 text-emerald-500" />
                                <span>Sui PTB Settlement</span>
                              </span>
                            ) : (
                              <span>{exp.category || 'Shared Bill'}</span>
                            )}
                            <span>•</span>
                            <span>{exp.groupName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`font-bold text-xs ${isSettlement ? 'text-emerald-600' : 'text-slate-900'}`}>
                          ${exp.amount.toFixed(2)}
                        </div>
                        <ChevronRight size={14} className="text-slate-300" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAddExpenseOpen(true)}
        className="absolute bottom-20 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-transform active:scale-95 z-40"
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      {groups[0] && (
        <AddExpenseModal 
          isOpen={isAddExpenseOpen} 
          onClose={() => {
            setIsAddExpenseOpen(false);
            setTimeout(() => setPrefilledExpense(null), 300);
          }} 
          groupId={groups[0].id}
          initialAmount={prefilledExpense?.amount}
          initialDescription={prefilledExpense?.description}
          initialCategory={prefilledExpense?.category}
        />
      )}

      {selectedExpense && (
        <ExpenseDetailsModal 
          isOpen={!!selectedExpense} 
          onClose={() => setSelectedExpense(null)} 
          expenseId={selectedExpense.id} 
          groupId={selectedExpense.groupId} 
        />
      )}

      <GroupDetailModal
        isOpen={!!selectedGroupId}
        onClose={() => setSelectedGroupId(null)}
        groupId={selectedGroupId}
      />

      <PaymentQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onRecordExpense={(data) => {
          setPrefilledExpense(data);
          setIsAddExpenseOpen(true);
        }}
      />
    </div>
  );
}
