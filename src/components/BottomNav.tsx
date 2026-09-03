'use client';
import { Home, Users, Wallet, Settings, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'home' | 'groups' | 'invest' | 'wallet' | 'settings';

export function BottomNav({ activeTab, onTabChange }: { activeTab: TabType, onTabChange: (tab: TabType) => void }) {
  return (
    <div className="absolute bottom-0 w-full h-16 bg-white/85 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-2 z-50 pb-safe">
      <NavItem icon={<Home size={21} />} label="Home" active={activeTab === 'home'} onClick={() => onTabChange('home')} />
      <NavItem icon={<Users size={21} />} label="Groups" active={activeTab === 'groups'} onClick={() => onTabChange('groups')} />
      
      {/* Touch 'n Go GO+ Style Invest Tab */}
      <NavItem 
        icon={
          <div className="relative">
            <TrendingUp size={21} className={activeTab === 'invest' ? 'text-emerald-600' : ''} />
            <span className="absolute -top-1.5 -right-3 bg-emerald-500 text-white text-[8px] font-extrabold px-1 rounded-full shadow-xs">
              3.6%
            </span>
          </div>
        } 
        label="Invest" 
        active={activeTab === 'invest'} 
        onClick={() => onTabChange('invest')} 
      />

      <NavItem icon={<Wallet size={21} />} label="Wallet" active={activeTab === 'wallet'} onClick={() => onTabChange('wallet')} />
      <NavItem icon={<Settings size={21} />} label="Settings" active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn("flex flex-col items-center justify-center space-y-1 text-slate-400 transition-colors cursor-pointer px-2 py-1", active && "text-blue-600 font-semibold")}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
