import { Transaction } from '@mysten/sui/transactions';
import { Settlement } from '../debtSimplification';

export const MOCK_USDC_TYPE = '0x2::sui::SUI'; // Using SUI for simplicity if Testnet USDC isn't handy, but logic is the same

export function buildSettlementPTB(settlements: Settlement[], userAddress: string, sourceCoinId: string) {
  const tx = new Transaction();

  const USDC_DECIMALS = 9; // Assuming SUI decimals for mock
  const multiplier = Math.pow(10, USDC_DECIMALS);

  const sourceCoin = tx.object(sourceCoinId);

  const amounts = settlements.map(s => Math.round(s.amount * multiplier));
  
  if (amounts.length > 0) {
    const splitCoins = tx.splitCoins(sourceCoin, amounts);
    
    settlements.forEach((settlement, index) => {
      // For MVP, if the ID doesn't look like a valid address, we mock a burn/transfer to a dummy address.
      // Assuming settlement.to is the user ID and we have their wallet address from the store.
      // To keep this pure, we pass the actual resolved address in the component layer.
      tx.transferObjects([splitCoins[index]], settlement.to);
    });
  }

  tx.setSender(userAddress);

  return tx;
}
