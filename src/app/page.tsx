'use client';
import { useState } from 'react';
import { BottomNav, TabType } from '@/components/BottomNav';
import { DashboardView } from '@/components/DashboardView';
import { GroupsView } from '@/components/GroupsView';
import { InvestView } from '@/components/InvestView';
import { WalletView } from '@/components/WalletView';
import { SettingsView } from '@/components/SettingsView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  return (
    <>
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'home' && <DashboardView onNavigateToInvest={() => setActiveTab('invest')} />}
        {activeTab === 'groups' && <GroupsView />}
        {activeTab === 'invest' && <InvestView />}
        {activeTab === 'wallet' && <WalletView />}
        {activeTab === 'settings' && <SettingsView />}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}
