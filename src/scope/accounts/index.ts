import { z } from 'zod';
import { defineTool, Scope } from '../../utils/tool.js';
import { BankDetail, RevolutAccount } from '../../types/revolut.js';
import { formatMoney, joinParts } from '../../utils/format.js';

function formatAccount(a: RevolutAccount): string {
  return [
    `• ${a.name ?? '(unnamed)'}  [${a.id}]`,
    `    Balance : ${formatMoney(a.balance, a.currency)}`,
    `    State   : ${a.state}${a.public ? ' (public)' : ''}`,
  ].join('\n');
}

function formatBankDetail(d: BankDetail, idx: number): string {
  const lines = [`Scheme set ${idx + 1}:`];
  if (d.iban) lines.push(`  IBAN         : ${d.iban}`);
  if (d.bic) lines.push(`  BIC/SWIFT    : ${d.bic}`);
  if (d.account_no) lines.push(`  Account no.  : ${d.account_no}`);
  if (d.sort_code) lines.push(`  Sort code    : ${d.sort_code}`);
  if (d.routing_number) lines.push(`  Routing no.  : ${d.routing_number}`);
  if (d.bank_country) lines.push(`  Bank country : ${d.bank_country}`);
  if (d.beneficiary) lines.push(`  Beneficiary  : ${d.beneficiary}`);
  if (d.schemes?.length) lines.push(`  Schemes      : ${d.schemes.join(', ')}`);
  if (d.estimated_time) {
    const t = d.estimated_time;
    const range = joinParts([t.min?.toString(), t.max?.toString()], '–');
    lines.push(`  Est. time    : ${joinParts([range, t.unit], ' ')}`);
  }
  return lines.join('\n');
}

const emptySchema = z.object({});
const accountIdSchema = z.object({
  accountId: z.string().min(1).describe('The Revolut account ID (UUID)'),
});

export const accountsScope: Scope = {
  name: 'accounts',
  description: 'Business accounts: list accounts with balances and inspect bank details.',
  tools: [
    defineTool({
      name: 'get_accounts',
      description:
        'Lists all Revolut Business accounts with their balance, currency, and state. Requires authentication.',
      schema: emptySchema,
      annotations: { title: 'Get accounts', readOnlyHint: true, openWorldHint: true },
      handler: async (_input, { client }) => {
        const accounts = await client.getAccounts();
        if (!accounts.length) return 'No accounts found.';
        return `${accounts.length} account(s):\n\n` + accounts.map(formatAccount).join('\n\n');
      },
    }),
    defineTool({
      name: 'get_account',
      description: 'Gets a single Revolut Business account by ID, including its balance and state.',
      schema: accountIdSchema,
      annotations: { title: 'Get account', readOnlyHint: true, openWorldHint: true },
      handler: async (input, { client }) => {
        const account = await client.getAccount(input.accountId);
        return formatAccount(account);
      },
    }),
    defineTool({
      name: 'get_account_bank_details',
      description:
        'Gets the bank details for a specific account — IBAN/BIC and/or local account number + sort code, supported schemes, and estimated settlement times.',
      schema: accountIdSchema,
      annotations: { title: 'Get account bank details', readOnlyHint: true, openWorldHint: true },
      handler: async (input, { client }) => {
        const details = await client.getAccountBankDetails(input.accountId);
        if (!details.length) return `No bank details found for account ${input.accountId}.`;
        return (
          `Bank details for account ${input.accountId}:\n\n` +
          details.map(formatBankDetail).join('\n\n')
        );
      },
    }),
  ],
};
