'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore, User } from '@/lib/store';

export function CreateGroupModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const store = useAppStore();
  const allUsers = store.allUsers;
  const currentUser = store.currentUser;

  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    allUsers.map(u => u.id)
  );
  const [newMemberName, setNewMemberName] = useState('');
  const [currency, setCurrency] = useState<'USDC' | 'AUSD' | 'FDUSD'>('USDC');

  const nameSuggestions = ['🗼 Tokyo Trip', '🏠 Apartment 402', '🏖️ Bali Getaway', '🍕 Friday Dinners', '⛷️ Ski Weekend'];

  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      if (selectedUserIds.length <= 2) return; // Minimum 2 people in a group
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedUserIds(prev => [...prev, userId]);
    }
  };

  const handleAddNewMember = () => {
    if (!newMemberName.trim()) return;
    const newUser: User = {
      id: 'u-' + Math.random().toString(36).substring(2, 8),
      name: newMemberName.trim(),
      walletAddress: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };
    store.allUsers.push(newUser);
    setSelectedUserIds(prev => [...prev, newUser.id]);
    setNewMemberName('');
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedUserIds.length < 2) return;

    const groupMembers = allUsers.filter(u => selectedUserIds.includes(u.id));

    const newGroup = {
      id: 'g-' + Math.random().toString(36).substring(2, 8),
      name: groupName.trim(),
      members: groupMembers,
      expenses: [],
    };

    store.addGroup(newGroup);
    setGroupName('');
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
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 max-h-[90%] bg-white rounded-t-3xl shadow-2xl z-[101] p-6 flex flex-col"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />

            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Users size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold">New Expense Group</h2>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pt-4 pb-4">
              {/* Group Name Input */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Group Name</label>
                <Input
                  placeholder="e.g. Kyoto Vacation"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="mt-1.5 text-base py-5 rounded-2xl bg-slate-50 border-slate-200/80"
                  autoFocus
                />
                
                {/* Suggestions */}
                <div className="flex space-x-2 overflow-x-auto pt-2 pb-1 scrollbar-hide">
                  {nameSuggestions.map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setGroupName(sug)}
                      className="px-3 py-1 rounded-xl text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-medium whitespace-nowrap transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settlement Stablecoin */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Settlement Currency</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {(['USDC', 'AUSD', 'FDUSD'] as const).map(coin => (
                    <button
                      key={coin}
                      type="button"
                      onClick={() => setCurrency(coin)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border text-center transition-all ${
                        currency === coin
                          ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {coin} {coin === 'USDC' && '⭐'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Native Sui stablecoin settled via zero-gas PTBs</p>
              </div>

              {/* Members Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">
                    Select Members ({selectedUserIds.length})
                  </label>
                  <span className="text-[11px] text-slate-400">Min. 2 members</span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {allUsers.map(user => {
                    const isSelected = selectedUserIds.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleUser(user.id)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-200 text-slate-900'
                            : 'bg-slate-50 border-slate-100 opacity-60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`}
                            alt={user.name}
                            className="w-7 h-7 rounded-full"
                          />
                          <span className="text-xs font-medium">
                            {user.name} {user.id === currentUser?.id && '(You)'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Member */}
                <div className="flex space-x-2 mt-3">
                  <Input
                    placeholder="Add friend (e.g. Dave)"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewMember()}
                    className="h-10 text-xs rounded-xl bg-slate-50"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewMember}
                    disabled={!newMemberName.trim()}
                    className="h-10 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs"
                  >
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedUserIds.length < 2}
              className="w-full mt-2 py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-200 text-base"
            >
              Create Group
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
