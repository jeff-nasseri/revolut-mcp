import { z } from 'zod';
import { RevolutClient } from '../client/revolut-client.js';
import { OBAccount, OBBalance } from '../types/revolut.js';

export const getAccountsInputSchema = z.object({});

export const getAccountBalanceInputSchema = z.object({
  accountId: z.string().describe('The Revolut account ID'),
});

function formatAccount(account: OBAccount): string {
  const lines = [
    `Account ID : ${account.AccountId}`,
    `Currency   : ${account.Currency}`,
    `Type       : ${account.AccountSubType}`,
  ];
  if (account.Nickname) lines.push(`Nickname   : ${account.Nickname}`);
  if (account.Description) lines.push(`Description: ${account.Description}`);
  return lines.join('\n');
}

function formatBalance(balance: OBBalance): string {
  const sign = balance.CreditDebitIndicator === 'Debit' ? '-' : '';
  return `${balance.Type}: ${sign}${balance.Amount.Amount} ${balance.Amount.Currency} (as of ${balance.DateTime})`;
}

export async function getAccounts(client: RevolutClient): Promise<string> {
  const response = await client.getAccounts();
  const accounts = response.Data.Account;

  if (accounts.length === 0) return 'No accounts found.';

  const sections = await Promise.all(
    accounts.map(async (account) => {
      const balanceResponse = await client.getAccountBalances(account.AccountId);
      const balances = balanceResponse.Data.Balance;

      const balanceLines = balances.map(formatBalance).join('\n  ');
      return `${formatAccount(account)}\nBalances:\n  ${balanceLines}`;
    })
  );

  return sections.join('\n\n---\n\n');
}

export async function getAccountBalance(
  client: RevolutClient,
  input: z.infer<typeof getAccountBalanceInputSchema>
): Promise<string> {
  const response = await client.getAccountBalances(input.accountId);
  const balances = response.Data.Balance;

  if (balances.length === 0) return `No balance data found for account ${input.accountId}.`;

  const lines = [`Balances for account ${input.accountId}:`, ''];
  for (const balance of balances) {
    lines.push(formatBalance(balance));
  }

  return lines.join('\n');
}
