'use client';
import { useState } from 'react';
import { BottomNav, TabType } from '@/components/BottomNav';
import { DashboardView } from '@/components/DashboardView';
import { GroupsView } from '@/components/GroupsView';
import { InvestView } from '@/components/InvestView';
import { WalletView } from '@/components/WalletView';
import { SettingsView } from '@/components/SettingsView';
import { EscrowView } from '@/components/EscrowView';
import { AuthScreen } from '@/components/AuthScreen';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!isAuthenticated && <AuthScreen onLogin={() => setIsAuthenticated(true)} />}
      </AnimatePresence>
      
      {isAuthenticated && (
        <>
          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'home' && <DashboardView onNavigateToInvest={() => setActiveTab('invest')} />}
            {activeTab === 'groups' && <GroupsView />}
            {activeTab === 'invest' && <InvestView />}
            {activeTab === 'escrow' && <EscrowView />}
            {activeTab === 'wallet' && <WalletView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
    </>
  );
}
