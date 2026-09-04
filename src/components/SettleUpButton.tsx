'use client';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { buildSettlementPTB } from '@/lib/sui/settlement';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Loader2, Zap } from 'lucide-react';
import { useState } from 'react';
import { SettlementReceiptModal, SettlementReceiptData } from './SettlementReceiptModal';

export function SettleUpButton({ groupId }: { groupId: string }) {
  const store = useAppStore();
  const account = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<SettlementReceiptData | null>(null);

  const group = store.groups.find(g => g.id === groupId);
  const settlements = store.getSettlements(groupId);
  const currentUser = store.currentUser;

  const mySettlements = settlements.filter(s => s.from === currentUser?.id);
  const totalAmountToSettle = mySettlements.reduce((sum, s) => sum + s.amount, 0);

  const handleSettle = async () => {
    if (!currentUser || !group) return;
    setLoading(true);
    try {
      // Ensure user has enough funds for demo
      if (store.walletBalance < totalAmountToSettle) {
        store.addFunds(Math.ceil(totalAmountToSettle - store.walletBalance + 50));
      }

      if (account) {
        const sourceCoinId = '0x0000000000000000000000000000000000000000000000000000000000000000';
        try {
          buildSettlementPTB(mySettlements, account.address, sourceCoinId);
        } catch (e) {
          console.warn('PTB construction simulation note:', e);
        }
      }
      
      // Simulate Sui sub-second finality
      await new Promise(resolve => setTimeout(resolve, 900));

      const randomHex = Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const generatedTxDigest = `0x${randomHex}`;

      const recipientDetails = mySettlements.map(s => {
        const recipient = group.members.find(m => m.id === s.to);
        return {
          name: recipient?.name || 'Member',
          amount: s.amount,
          address: recipient?.walletAddress || '0x456...def',
        };
      });

      // Execute in store: creates settlement entries, drops net debt to $0, logs tx
      store.executeSettlement(groupId, currentUser.id, mySettlements, generatedTxDigest);

      // Open the Sui On-Chain Receipt Modal
      setReceiptData({
        groupId,
        groupName: group.name,
        totalAmount: totalAmountToSettle,
        txDigest: generatedTxDigest,
        recipients: recipientDetails,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error('Settlement failed:', e);
    } finally {
      setLoading(false);
    }
  };

  if (totalAmountToSettle <= 0.01) return null;

  return (
    <>
      <Button 
        size="lg" 
        onClick={handleSettle}
        disabled={loading}
        className="w-full py-7 rounded-2xl shadow-lg shadow-blue-200 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Executing PTB on Sui...</span>
          </>
        ) : (
          <>
            <Zap className="h-5 w-5 fill-white" />
            <span>Settle ${totalAmountToSettle.toFixed(2)} (0 Gas)</span>
          </>
        )}
      </Button>

      <SettlementReceiptModal
        isOpen={!!receiptData}
        onClose={() => setReceiptData(null)}
        data={receiptData}
      />
    </>
  );
}
