'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Users, Plus, ChevronRight, Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CreateGroupModal } from './CreateGroupModal';
import { GroupDetailModal } from './GroupDetailModal';

export function GroupsView() {
  const store = useAppStore();
  const groups = store.groups;
  const currentUser = store.currentUser;

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-16">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white rounded-b-3xl shadow-sm z-10 relative flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your shared expense circles</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md shadow-blue-200 transition-transform active:scale-95 flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative z-0">
        <ScrollArea className="h-full px-6 pt-6">
          <div className="space-y-4 mb-24">
            {groups.map(group => {
              const settlements = store.getSettlements(group.id);
              const myDebt = settlements
                .filter(s => s.from === currentUser?.id)
                .reduce((sum, s) => sum + s.amount, 0);
              const myCredit = settlements
                .filter(s => s.to === currentUser?.id)
                .reduce((sum, s) => sum + s.amount, 0);

              const totalSpend = group.expenses.reduce((sum, exp) => sum + exp.amount, 0);

              return (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-200 cursor-pointer transition-all hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100/60 shadow-xs">
                        <Users size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-800">{group.name}</h3>
                        <p className="text-xs text-slate-500">
                          {group.members.length} members • ${totalSpend.toFixed(2)} spent
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>

                  {/* Status Pills */}
                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                    <div className="text-xs font-semibold">
                      {myDebt > 0 ? (
                        <span className="text-rose-500">You owe ${myDebt.toFixed(2)}</span>
                      ) : myCredit > 0 ? (
                        <span className="text-emerald-500">You're owed ${myCredit.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">All settled up</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-blue-600 hover:underline">
                      View Circle →
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Create Group Button Card */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="w-full bg-white hover:bg-blue-50/50 border-2 border-dashed border-blue-200 text-blue-600 p-5 rounded-3xl flex items-center justify-center space-x-2 font-semibold text-sm transition-all active:scale-[0.99] shadow-xs"
            >
              <Plus size={18} />
              <span>Create New Expense Group</span>
            </button>
          </div>
        </ScrollArea>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <GroupDetailModal
        isOpen={!!selectedGroupId}
        onClose={() => setSelectedGroupId(null)}
        groupId={selectedGroupId}
      />
    </div>
  );
}
