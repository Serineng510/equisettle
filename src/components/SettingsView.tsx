'use client';
import { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  CircleHelp, 
  ChevronRight, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  X, 
  Users, 
  Globe, 
  Trash2,
  Lock,
  Sparkles
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export function SettingsView() {
  const store = useAppStore();
  const currentUser = store.currentUser;
  const allUsers = store.allUsers || [];

  // Active modal state
  const [activeModal, setActiveModal] = useState<'security' | 'notifications' | 'help' | 'network' | 'reset' | null>(null);

  // Notification toggles
  const [notifSettings, setNotifSettings] = useState({
    settlements: true,
    expenses: true,
    gasSponsorship: true,
  });

  // Network selection
  const [selectedNetwork, setSelectedNetwork] = useState<'testnet' | 'devnet' | 'mainnet'>('testnet');

  // Keypair regeneration state
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(currentUser?.walletAddress || '0x123...abc');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = async () => {
    setIsRegenerating(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsRegenerating(false);
    showToast('New ephemeral Ed25519 keypair generated!');
  };

  const handleResetApp = () => {
    store.resetState();
    setActiveModal(null);
    showToast('Mock data & balances reset to defaults!');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-16">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white rounded-b-3xl shadow-sm z-10 relative">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Preferences, zkLogin & demo controls</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative z-0">
        <ScrollArea className="h-full px-6 pt-6">
          <div className="space-y-6 mb-24">
            
            {/* User Profile Card with User Switching */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-14 w-14 border-2 border-blue-100 shadow-sm">
                  <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.name}`} />
                  <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg text-slate-800 truncate">{currentUser?.name}</div>
                  <div className="text-xs text-slate-500 font-mono truncate">
                    {currentUser?.walletAddress ? `${currentUser.walletAddress.slice(0, 8)}...${currentUser.walletAddress.slice(-6)}` : 'No wallet connected'}
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active</span>
                </div>
              </div>

              {/* Quick Switch Persona for Demo */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center space-x-1">
                  <Users size={13} />
                  <span>Switch Demo Persona:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {allUsers.map((user) => {
                    const isCurrent = user.id === currentUser?.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          store.setCurrentUser(user);
                          showToast(`Switched view to ${user.name}`);
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-medium transition-all text-center truncate ${
                          isCurrent 
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' 
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/50'
                        }`}
                      >
                        {user.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* App Settings */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-2">App Settings</h3>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                
                <SettingRow
                  icon={<Shield size={20} className="text-blue-500" />}
                  title="Security & zkLogin"
                  subtitle="Ephemeral keys, session proofs & relayer"
                  onClick={() => setActiveModal('security')}
                />

                <SettingRow
                  icon={<Bell size={20} className="text-amber-500" />}
                  title="Notifications"
                  subtitle="Settlements, expenses & sponsor alerts"
                  onClick={() => setActiveModal('notifications')}
                />

                <SettingRow
                  icon={<CircleHelp size={20} className="text-indigo-500" />}
                  title="Help & FAQ"
                  subtitle="Debt algorithm, zero gas & architecture"
                  onClick={() => setActiveModal('help')}
                />

              </div>
            </div>

            {/* Developer / Hackathon Controls */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-2">Developer & Network</h3>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                
                <SettingRow
                  icon={<Globe size={20} className="text-teal-500" />}
                  title="Network Environment"
                  subtitle={selectedNetwork === 'testnet' ? 'Sui Testnet (Active)' : selectedNetwork === 'devnet' ? 'Sui Devnet' : 'Sui Mainnet'}
                  onClick={() => setActiveModal('network')}
                />

                <SettingRow
                  icon={<Trash2 size={20} className="text-rose-500" />}
                  title="Reset Mock Data"
                  subtitle="Restore initial expenses & wallet balances"
                  onClick={() => setActiveModal('reset')}
                />

              </div>
            </div>

            {/* Hackathon Track Info Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-slate-700">
              <div className="flex items-center space-x-2 text-blue-700 font-semibold text-xs mb-1">
                <Sparkles size={14} />
                <span>Sui Hackathon • Track 1</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                EquiSettle leverages Sui Programmable Transaction Blocks (PTB) and zkLogin for one-tap, zero-gas peer-to-peer debt settlements.
              </p>
            </div>

          </div>
        </ScrollArea>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl z-50 flex items-center justify-between text-xs font-medium"
          >
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-[100]"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85%] bg-white rounded-t-3xl shadow-2xl z-[101] p-6 flex flex-col"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 shrink-0" />

              {/* Modal 1: Security & zkLogin */}
              {activeModal === 'security' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Shield size={20} className="text-blue-600" />
                      <h2 className="text-lg font-bold">Security & zkLogin</h2>
                    </div>
                    <button onClick={() => setActiveModal(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-xs font-semibold text-slate-400 uppercase">Provider</div>
                      <div className="font-semibold text-slate-800 text-sm mt-0.5">Google OAuth via zkLogin</div>
                      <div className="text-xs text-slate-500 mt-1">Zero-knowledge proof protects email address on-chain.</div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase">Ephemeral Keypair</div>
                          <div className="font-semibold text-slate-800 text-sm mt-0.5">Ed25519 (Client Memory)</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleRegenerateKey}
                          disabled={isRegenerating}
                          className="h-8 text-xs rounded-xl"
                        >
                          <RefreshCw size={12} className={`mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                          {isRegenerating ? 'Rotating...' : 'Rotate Key'}
                        </Button>
                      </div>
                      <div className="mt-2 text-xs font-mono text-slate-600 bg-white p-2 rounded-xl border border-slate-200/60 truncate flex items-center justify-between">
                        <span>{currentUser?.walletAddress || '0x...'}</span>
                        <button onClick={handleCopyKey} className="ml-2 text-blue-600 hover:text-blue-700">
                          {copiedKey ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-xs font-semibold text-slate-400 uppercase">Gas Relayer</div>
                      <div className="font-semibold text-slate-800 text-sm mt-0.5">Sponsored (0 SUI Required)</div>
                      <div className="text-xs text-slate-500 mt-1">Backend sponsor pays gas for all Programmable Transaction Blocks.</div>
                    </div>
                  </div>

                  <Button onClick={() => setActiveModal(null)} className="w-full mt-2 py-6 rounded-2xl bg-blue-600 hover:bg-blue-700">
                    Done
                  </Button>
                </div>
              )}

              {/* Modal 2: Notifications */}
              {activeModal === 'notifications' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Bell size={20} className="text-amber-500" />
                      <h2 className="text-lg font-bold">Notification Preferences</h2>
                    </div>
                    <button onClick={() => setActiveModal(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3 pt-1">
                    <ToggleItem
                      title="Settlement Requests"
                      description="Notify me when a group member initiates Settle Up"
                      enabled={notifSettings.settlements}
                      onToggle={() => setNotifSettings(s => ({ ...s, settlements: !s.settlements }))}
                    />

                    <ToggleItem
                      title="New Expense Added"
                      description="Alert when someone logs a shared bill involving me"
                      enabled={notifSettings.expenses}
                      onToggle={() => setNotifSettings(s => ({ ...s, expenses: !s.expenses }))}
                    />

                    <ToggleItem
                      title="Gas Sponsorship Receipts"
                      description="Confirmations when transactions execute with 0 gas"
                      enabled={notifSettings.gasSponsorship}
                      onToggle={() => setNotifSettings(s => ({ ...s, gasSponsorship: !s.gasSponsorship }))}
                    />
                  </div>

                  <Button 
                    onClick={() => {
                      setActiveModal(null);
                      showToast('Notification settings saved!');
                    }} 
                    className="w-full mt-3 py-6 rounded-2xl bg-slate-900 hover:bg-slate-800"
                  >
                    Save Preferences
                  </Button>
                </div>
              )}

              {/* Modal 3: Help & FAQ */}
              {activeModal === 'help' && (
                <div className="space-y-4 overflow-y-auto pr-1">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <CircleHelp size={20} className="text-indigo-600" />
                      <h2 className="text-lg font-bold">Help & Architecture FAQ</h2>
                    </div>
                    <button onClick={() => setActiveModal(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="font-semibold text-slate-800 text-sm mb-1">💡 How does Debt Simplification work?</div>
                      <p className="text-slate-600">
                        EquiSettle calculates the net balance for each person and uses a greedy cash-flow simplification algorithm. This compresses tangled group debts (e.g. 10 cross-payments) down to the absolute minimum number of transfers (at most N-1).
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="font-semibold text-slate-800 text-sm mb-1">⛽ Why don't users pay gas fees?</div>
                      <p className="text-slate-600">
                        We use Sui's sponsored transactions. The client builds the Programmable Transaction Block (PTB) and sends the transaction bytes to our gas relayer backend, which co-signs and pays the SUI gas fee on behalf of the user.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="font-semibold text-slate-800 text-sm mb-1">🔐 How does zkLogin protect my funds?</div>
                      <p className="text-slate-600">
                        Users sign in with Google OAuth. Sui zkLogin uses zero-knowledge SNARK proofs to link an ephemeral Ed25519 keypair to your Google identity without exposing your email address or storing seed phrases.
                      </p>
                    </div>
                  </div>

                  <Button onClick={() => setActiveModal(null)} className="w-full mt-2 py-6 rounded-2xl bg-blue-600 hover:bg-blue-700">
                    Got it
                  </Button>
                </div>
              )}

              {/* Modal 4: Network Environment */}
              {activeModal === 'network' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Globe size={20} className="text-teal-600" />
                      <h2 className="text-lg font-bold">Network Environment</h2>
                    </div>
                    <button onClick={() => setActiveModal(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <NetworkOption
                      name="Sui Testnet"
                      rpc="https://fullnode.testnet.sui.io:443"
                      selected={selectedNetwork === 'testnet'}
                      badge="Recommended for Hackathon"
                      onClick={() => {
                        setSelectedNetwork('testnet');
                        setActiveModal(null);
                        showToast('Connected to Sui Testnet');
                      }}
                    />

                    <NetworkOption
                      name="Sui Devnet"
                      rpc="https://fullnode.devnet.sui.io:443"
                      selected={selectedNetwork === 'devnet'}
                      onClick={() => {
                        setSelectedNetwork('devnet');
                        setActiveModal(null);
                        showToast('Connected to Sui Devnet');
                      }}
                    />

                    <NetworkOption
                      name="Sui Mainnet"
                      rpc="https://fullnode.mainnet.sui.io:443"
                      selected={selectedNetwork === 'mainnet'}
                      badge="Production"
                      onClick={() => {
                        setSelectedNetwork('mainnet');
                        setActiveModal(null);
                        showToast('Mainnet mode enabled');
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Modal 5: Reset App State Confirmation */}
              {activeModal === 'reset' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
                    <Trash2 size={24} />
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-lg font-bold text-slate-900">Reset Mock State?</h2>
                    <p className="text-xs text-slate-500 mt-1.5 px-4">
                      This will restore all default demo expenses, group members, and reset your mock USDC wallet balance to $0.00.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveModal(null)}
                      className="py-6 rounded-2xl border-slate-200 font-medium text-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleResetApp}
                      className="py-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-md shadow-rose-200"
                    >
                      Reset App
                    </Button>
                  </div>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

function SettingRow({ 
  icon, 
  title, 
  subtitle, 
  onClick 
}: { 
  icon: React.ReactNode, 
  title: string, 
  subtitle?: string, 
  onClick?: () => void 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 active:bg-slate-100 transition-colors text-left"
    >
      <div className="flex items-center space-x-3.5 min-w-0">
        <div className="p-2.5 bg-slate-50 rounded-2xl shrink-0 border border-slate-100">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-800 text-sm truncate">{title}</div>
          {subtitle && <div className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</div>}
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-300 shrink-0 ml-2" />
    </button>
  );
}

function ToggleItem({
  title,
  description,
  enabled,
  onToggle
}: {
  title: string,
  description: string,
  enabled: boolean,
  onToggle: () => void
}) {
  return (
    <div 
      onClick={onToggle}
      className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer select-none"
    >
      <div className="pr-3">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{description}</div>
      </div>
      <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${enabled ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}

function NetworkOption({
  name,
  rpc,
  selected,
  badge,
  onClick
}: {
  name: string,
  rpc: string,
  selected: boolean,
  badge?: string,
  onClick: () => void
}) {
  return (
    <div 
      onClick={onClick}
      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
        selected 
          ? 'bg-teal-50/70 border-teal-300 ring-1 ring-teal-400' 
          : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
      }`}
    >
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm text-slate-800">{name}</span>
          {badge && (
            <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className="text-xs font-mono text-slate-400 mt-0.5">{rpc}</div>
      </div>
      {selected && <Check size={18} className="text-teal-600 shrink-0" />}
    </div>
  );
}
