import { create } from 'zustand';
import { Expense, Settlement, simplifyDebts } from './debtSimplification';

export interface User {
  id: string;
  name: string;
  walletAddress?: string;
}

export interface Group {
  id: string;
  name: string;
  members: User[];
  expenses: Expense[];
}

export interface WalletTransaction {
  id: string;
  type: 'topup' | 'settlement' | 'received';
  title: string;
  amount: number;
  date: string;
  txDigest?: string;
  gasSponsored: boolean;
}

export interface Escrow {
  id: string;
  recipientName: string;
  amount: number;
  unlockDate: string;
  status: 'locked' | 'released';
}

export interface AppState {
  currentUser: User | null;
  allUsers: User[];
  groups: Group[];
  escrows: Escrow[];
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  investBalance: number;
  totalInterestEarned: number;
  autoSweep: boolean;
  setCurrentUser: (user: User) => void;
  addGroup: (group: Group) => void;
  addExpense: (groupId: string, expense: Expense) => void;
  getSettlements: (groupId: string) => Settlement[];
  addFunds: (amount: number) => void;
  deductFunds: (amount: number) => void;
  executeSettlement: (groupId: string, payerId: string, settlementsToExecute: Settlement[], txDigest: string) => void;
  depositToInvest: (amount: number) => void;
  withdrawFromInvest: (amount: number) => void;
  toggleAutoSweep: () => void;
  payDuitNow: (amount: number, merchant: string, provider: string) => void;
  createEscrow: (amount: number, recipientName: string, daysLocked: number) => void;
  releaseEscrow: (escrowId: string) => void;
  resetState: () => void;
}

// Mock initial data
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice (You)', walletAddress: '0x1234567890abcdef1234567890abcdef12345678' },
  { id: 'u2', name: 'Bob', walletAddress: '0x4567890abcdef1234567890abcdef1234567890a' },
  { id: 'u3', name: 'Charlie', walletAddress: '0x7890abcdef1234567890abcdef1234567890abcd' },
];

const MOCK_GROUP: Group = {
  id: 'g1',
  name: 'Bali Trip',
  members: MOCK_USERS,
  expenses: [
    {
      id: 'e1',
      payerId: 'u1',
      amount: 150,
      participants: [
        { userId: 'u1', amountOwed: 50 },
        { userId: 'u2', amountOwed: 50 },
        { userId: 'u3', amountOwed: 50 },
      ],
    },
    {
      id: 'e2',
      payerId: 'u2',
      amount: 60,
      participants: [
        { userId: 'u1', amountOwed: 30 },
        { userId: 'u2', amountOwed: 30 },
      ],
    },
    {
      id: 'e3',
      payerId: 'u3',
      amount: 45,
      participants: [
        { userId: 'u1', amountOwed: 15 },
        { userId: 'u2', amountOwed: 15 },
        { userId: 'u3', amountOwed: 15 },
      ],
    },
    {
      id: 'e4',
      payerId: 'u1',
      amount: 120,
      participants: [
        { userId: 'u1', amountOwed: 40 },
        { userId: 'u2', amountOwed: 40 },
        { userId: 'u3', amountOwed: 40 },
      ],
    },
    {
      id: 'e5',
      payerId: 'u2',
      amount: 25,
      participants: [
        { userId: 'u1', amountOwed: 12.5 },
        { userId: 'u2', amountOwed: 12.5 },
      ],
    },
    {
      id: 'e6',
      payerId: 'u3',
      amount: 80,
      participants: [
        { userId: 'u1', amountOwed: 40 },
        { userId: 'u3', amountOwed: 40 },
      ],
    },
    {
      id: 'e7',
      payerId: 'u1',
      amount: 15,
      participants: [
        { userId: 'u1', amountOwed: 5 },
        { userId: 'u2', amountOwed: 5 },
        { userId: 'u3', amountOwed: 5 },
      ],
    }
  ],
};

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: MOCK_USERS[0],
  allUsers: MOCK_USERS,
  escrows: [
    {
      id: 'escrow-1',
      recipientName: 'Bali Villa Host',
      amount: 250,
      unlockDate: new Date(Date.now() + 86400000 * 3).toISOString(), // +3 days
      status: 'locked'
    }
  ],
  groups: [JSON.parse(JSON.stringify(MOCK_GROUP))],
  walletBalance: 100,
  investBalance: 250,
  totalInterestEarned: 4.28,
  autoSweep: true,
  walletTransactions: [
    {
      id: 'tx-welcome',
      type: 'topup',
      title: 'Welcome USDC Grant',
      amount: 100,
      date: new Date(Date.now() - 3600000).toISOString(),
      txDigest: '0x9fa18c2b7e54...testnet',
      gasSponsored: true,
    }
  ],
  setCurrentUser: (user) => set({ currentUser: user }),
  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),
  addExpense: (groupId, expense) => set((state) => ({
    groups: state.groups.map(g => 
      g.id === groupId ? { ...g, expenses: [expense, ...g.expenses] } : g
    )
  })),
  getSettlements: (groupId) => {
    const group = get().groups.find(g => g.id === groupId);
    if (!group) return [];
    return simplifyDebts(group.expenses);
  },
  addFunds: (amount) => set((state) => ({ 
    walletBalance: state.walletBalance + amount,
    walletTransactions: [
      {
        id: 'tx-' + Math.random().toString(36).substring(2, 9),
        type: 'topup',
        title: 'USDC Faucet Top Up',
        amount,
        date: new Date().toISOString(),
        txDigest: '0x' + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...testnet',
        gasSponsored: true,
      },
      ...state.walletTransactions
    ]
  })),
  deductFunds: (amount) => set((state) => ({ walletBalance: Math.max(0, state.walletBalance - amount) })),
  depositToInvest: (amount) => {
    const state = get();
    // If not enough in wallet, auto-credit for smooth hackathon demo
    const effectiveWallet = state.walletBalance < amount ? amount + 50 : state.walletBalance;
    const newTx: WalletTransaction = {
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      type: 'settlement',
      title: 'Deposited to EquiYield GO+ (3.6% p.a.)',
      amount,
      date: new Date().toISOString(),
      txDigest: '0x' + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...testnet',
      gasSponsored: true,
    };
    set({
      walletBalance: effectiveWallet - amount,
      investBalance: state.investBalance + amount,
      walletTransactions: [newTx, ...state.walletTransactions],
    });
  },
  withdrawFromInvest: (amount) => {
    const state = get();
    const actualAmount = Math.min(amount, state.investBalance);
    if (actualAmount <= 0) return;
    const newTx: WalletTransaction = {
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      type: 'topup',
      title: 'Cashed out from EquiYield GO+',
      amount: actualAmount,
      date: new Date().toISOString(),
      txDigest: '0x' + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...testnet',
      gasSponsored: true,
    };
    set({
      walletBalance: state.walletBalance + actualAmount,
      investBalance: state.investBalance - actualAmount,
      walletTransactions: [newTx, ...state.walletTransactions],
    });
  },
  toggleAutoSweep: () => set((state) => ({ autoSweep: !state.autoSweep })),
  payDuitNow: (amount, merchant, provider) => {
    const state = get();
    // Simulate auto-sweep if insufficient funds but GO+ is enabled
    let finalWalletBalance = state.walletBalance;
    let finalInvestBalance = state.investBalance;

    if (state.walletBalance < amount && state.autoSweep && state.investBalance > 0) {
      const shortfall = amount - state.walletBalance;
      const sweptAmount = Math.min(shortfall, state.investBalance);
      finalWalletBalance += sweptAmount;
      finalInvestBalance -= sweptAmount;
    }

    // Force credit if still not enough (for smooth hackathon demo)
    if (finalWalletBalance < amount) {
      finalWalletBalance = amount + 20; 
    }

    const newTx: WalletTransaction = {
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      type: 'settlement',
      title: `DuitNow: ${merchant} (${provider})`,
      amount,
      date: new Date().toISOString(),
      txDigest: '0x' + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...testnet',
      gasSponsored: true,
    };

    set({
      walletBalance: finalWalletBalance - amount,
      investBalance: finalInvestBalance,
      walletTransactions: [newTx, ...state.walletTransactions],
    });
  },
  createEscrow: (amount, recipientName, daysLocked) => {
    const state = get();
    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + daysLocked);

    const newEscrow: Escrow = {
      id: 'escrow-' + Math.random().toString(36).substring(2, 9),
      recipientName,
      amount,
      unlockDate: unlockDate.toISOString(),
      status: 'locked'
    };

    const newTx: WalletTransaction = {
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      type: 'settlement',
      title: `Escrow Created: ${recipientName}`,
      amount,
      date: new Date().toISOString(),
      txDigest: '0x' + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...testnet',
      gasSponsored: true,
    };

    set({
      walletBalance: Math.max(0, state.walletBalance - amount),
      escrows: [newEscrow, ...state.escrows],
      walletTransactions: [newTx, ...state.walletTransactions]
    });
  },
  releaseEscrow: (escrowId) => {
    const state = get();
    const escrow = state.escrows.find(e => e.id === escrowId);
    if (!escrow || escrow.status === 'released') return;

    set({
      escrows: state.escrows.map(e => 
        e.id === escrowId ? { ...e, status: 'released' } : e
      )
    });
  },
  executeSettlement: (groupId, payerId, settlementsToExecute, txDigest) => {
    const state = get();
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;

    let totalAmount = 0;
    const newSettlementExpenses: Expense[] = [];

    settlementsToExecute.forEach((s) => {
      if (s.from === payerId) {
        totalAmount += s.amount;
        const receiver = group.members.find(m => m.id === s.to);
        newSettlementExpenses.push({
          id: 'settle-' + Math.random().toString(36).substring(2, 9),
          payerId: s.from,
          amount: s.amount,
          description: `Settled debt with ${receiver?.name || 'Member'}`,
          category: '⚡ Settlement',
          date: new Date().toISOString(),
          participants: [
            {
              userId: s.to,
              amountOwed: s.amount,
            }
          ]
        });
      }
    });

    const newTx: WalletTransaction = {
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      type: 'settlement',
      title: `Settled ${group.name} debt`,
      amount: totalAmount,
      date: new Date().toISOString(),
      txDigest: txDigest,
      gasSponsored: true,
    };

    set({
      walletBalance: Math.max(0, state.walletBalance - totalAmount),
      walletTransactions: [newTx, ...state.walletTransactions],
      groups: state.groups.map(g => 
        g.id === groupId 
          ? { ...g, expenses: [...newSettlementExpenses, ...g.expenses] }
          : g
      )
    });
  },
  resetState: () => set({
    currentUser: MOCK_USERS[0],
    groups: [JSON.parse(JSON.stringify(MOCK_GROUP))],
    walletBalance: 100,
    investBalance: 250,
    totalInterestEarned: 4.28,
    autoSweep: true,
    walletTransactions: [
      {
        id: 'tx-welcome',
        type: 'topup',
        title: 'Welcome USDC Grant',
        amount: 100,
        date: new Date().toISOString(),
        txDigest: '0x9fa18c2b7e54...testnet',
        gasSponsored: true,
      }
    ],
  }),
}));
