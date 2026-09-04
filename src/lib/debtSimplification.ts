export interface Expense {
  id: string;
  payerId: string;
  amount: number;
  description?: string;
  category?: string;
  date?: string;
  participants: { userId: string; amountOwed: number }[];
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function simplifyDebts(expenses: Expense[]): Settlement[] {
  const balances: Record<string, number> = {};

  // Calculate net balances
  expenses.forEach(expense => {
    if (!balances[expense.payerId]) balances[expense.payerId] = 0;
    
    let totalOwedToPayer = 0;

    expense.participants.forEach(p => {
      if (p.userId !== expense.payerId) {
        totalOwedToPayer += p.amountOwed;
        if (!balances[p.userId]) balances[p.userId] = 0;
        balances[p.userId] -= p.amountOwed;
      }
    });

    balances[expense.payerId] += totalOwedToPayer;
  });

  const creditors: { userId: string; amount: number }[] = [];
  const debtors: { userId: string; amount: number }[] = [];

  for (const [userId, balance] of Object.entries(balances)) {
    if (balance > 0.01) creditors.push({ userId, amount: balance });
    else if (balance < -0.01) debtors.push({ userId, amount: Math.abs(balance) });
  }

  // Sort by amount descending to minimize transactions
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Number(amount.toFixed(2)),
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}
