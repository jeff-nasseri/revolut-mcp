import { z } from 'zod';
import { defineTool, Scope } from '../../utils/tool.js';
import { RevolutTransaction, TransactionLeg } from '../../types/revolut.js';
import { dateOnly, formatMoney, humanize } from '../../utils/format.js';

function formatLeg(leg: TransactionLeg): string {
  const parts = [`     ${formatMoney(leg.amount, leg.currency)}`];
  if (leg.description) parts.push(`— ${leg.description}`);
  if (leg.balance !== undefined) parts.push(`(running balance: ${formatMoney(leg.balance, leg.currency)})`);
  return parts.join(' ');
}

function formatTransaction(tx: RevolutTransaction, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : '';
  const when = dateOnly(tx.completed_at ?? tx.created_at);
  const lines = [`${prefix}[${humanize(tx.state)}] ${when}  ${humanize(tx.type)}`, `   ID: ${tx.id}`];
  if (tx.reference) lines.push(`   Reference: ${tx.reference}`);
  if (tx.merchant?.name) lines.push(`   Merchant: ${tx.merchant.name}`);
  for (const leg of tx.legs ?? []) lines.push(formatLeg(leg));
  return lines.join('\n');
}

const dateRe = /^\d{4}-\d{2}-\d{2}$/;

const listSchema = z.object({
  account: z.string().optional().describe('Filter by account ID (UUID)'),
  from: z
    .string()
    .regex(dateRe, 'Date must be YYYY-MM-DD')
    .optional()
    .describe('Start date (YYYY-MM-DD)'),
  to: z
    .string()
    .regex(dateRe, 'Date must be YYYY-MM-DD')
    .optional()
    .describe('End date (YYYY-MM-DD)'),
  type: z
    .string()
    .optional()
    .describe('Filter by transaction type, e.g. transfer, card_payment, exchange, topup, fee'),
  count: z
    .number()
    .int()
    .positive()
    .max(1000)
    .optional()
    .default(100)
    .describe('Maximum number of transactions to return (1–1000, default 100)'),
});

const detailSchema = z.object({
  transactionId: z.string().min(1).describe('The transaction ID (UUID)'),
});

export const transactionsScope: Scope = {
  name: 'transactions',
  description: 'Transaction history and single-transaction detail.',
  tools: [
    defineTool({
      name: 'get_transactions',
      description:
        'Retrieves transaction history with optional account, date range, and type filtering. Each transaction includes its legs (per-account amount, description, and running balance).',
      schema: listSchema,
      annotations: { title: 'Get transactions', readOnlyHint: true, openWorldHint: true },
      handler: async (input, { client }) => {
        const transactions = await client.getTransactions({
          account: input.account,
          from: input.from,
          to: input.to,
          type: input.type,
          count: input.count,
        });
        if (!transactions.length) return 'No transactions found for the given criteria.';
        const header = `Showing ${transactions.length} transaction(s):`;
        const body = transactions.map((tx, i) => formatTransaction(tx, i)).join('\n\n');
        return `${header}\n\n${body}`;
      },
    }),
    defineTool({
      name: 'get_transaction',
      description:
        'Gets full details of a single transaction by ID, including type, state, timestamps, and all legs.',
      schema: detailSchema,
      annotations: { title: 'Get transaction', readOnlyHint: true, openWorldHint: true },
      handler: async (input, { client }) => {
        const tx = await client.getTransaction(input.transactionId);
        const lines = [
          'Transaction Detail',
          '==================',
          `ID         : ${tx.id}`,
          `Type       : ${humanize(tx.type)}`,
          `State      : ${humanize(tx.state)}`,
          `Created    : ${tx.created_at}`,
        ];
        if (tx.completed_at) lines.push(`Completed  : ${tx.completed_at}`);
        if (tx.scheduled_for) lines.push(`Scheduled  : ${tx.scheduled_for}`);
        if (tx.reference) lines.push(`Reference  : ${tx.reference}`);
        if (tx.request_id) lines.push(`Request ID : ${tx.request_id}`);
        if (tx.merchant?.name) lines.push(`Merchant   : ${tx.merchant.name}`);
        lines.push('', 'Legs:');
        for (const leg of tx.legs ?? []) lines.push(formatLeg(leg));
        return lines.join('\n');
      },
    }),
  ],
};
