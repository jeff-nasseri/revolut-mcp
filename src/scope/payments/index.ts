import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { defineTool, Scope } from '../../utils/tool.js';
import { PaymentDraftSummary, TransferReason } from '../../types/revolut.js';
import { formatMoney } from '../../utils/format.js';

const emptySchema = z.object({});

const createPaymentSchema = z.object({
  account_id: z.string().min(1).describe('Source account ID (UUID) to debit'),
  counterparty_id: z.string().min(1).describe('Counterparty (payee) ID to pay'),
  counterparty_account_id: z
    .string()
    .optional()
    .describe('Specific counterparty account ID (UUID); required when the counterparty has multiple accounts'),
  amount: z.number().positive().describe('Amount to pay'),
  currency: z.string().length(3).describe('Payment currency (ISO 4217)'),
  reference: z.string().optional().describe('Payment reference shown to the recipient'),
  request_id: z.string().optional().describe('Idempotency key; a UUID is generated automatically if omitted'),
});

const transferSchema = z.object({
  source_account_id: z.string().min(1).describe('Source account ID (UUID) to debit'),
  target_account_id: z
    .string()
    .min(1)
    .describe('Target account ID (UUID) to credit (must be one of your own accounts)'),
  amount: z.number().positive().describe('Amount to transfer'),
  currency: z.string().length(3).describe('Transfer currency (ISO 4217)'),
  reference: z.string().optional().describe('Transfer reference'),
  request_id: z.string().optional().describe('Idempotency key; a UUID is generated automatically if omitted'),
});

const cancelSchema = z.object({
  transactionId: z.string().min(1).describe('The transaction ID (UUID) to cancel'),
});

const reasonsSchema = z.object({
  country: z.string().length(2).optional().describe('Filter by counterparty country (ISO 3166-1 alpha-2)'),
  currency: z.string().length(3).optional().describe('Filter by currency (ISO 4217)'),
});

const REASONS_LIMIT = 50;

function formatDraft(d: PaymentDraftSummary): string {
  const lines = [`• ${d.title ?? '(untitled)'}  [${d.id}]`];
  if (d.state) lines.push(`    State    : ${d.state}`);
  if (d.scheduled_for) lines.push(`    Scheduled: ${d.scheduled_for}`);
  return lines.join('\n');
}

export const paymentsScope: Scope = {
  name: 'payments',
  description: 'Payments and transfers: drafts, transfer reasons, pay a counterparty, move money between your accounts, and cancel scheduled transactions.',
  tools: [
    defineTool({
      name: 'get_payment_drafts',
      description: 'Lists pending payment drafts (payment orders awaiting approval).',
      schema: emptySchema,
      annotations: { title: 'Get payment drafts', readOnlyHint: true, openWorldHint: true },
      handler: async (_input, { client }) => {
        const { payment_orders } = await client.getPaymentDrafts();
        if (!payment_orders?.length) return 'No payment drafts found.';
        return `${payment_orders.length} payment draft(s):\n\n` + payment_orders.map(formatDraft).join('\n\n');
      },
    }),
    defineTool({
      name: 'get_transfer_reasons',
      description:
        'Lists valid transfer reason codes (required for transfers/payments to certain countries and currencies). Optionally filter by country and/or currency.',
      schema: reasonsSchema,
      annotations: { title: 'Get transfer reasons', readOnlyHint: true, openWorldHint: true },
      handler: async (input, { client }) => {
        let reasons: TransferReason[] = await client.getTransferReasons();
        if (input.country) {
          const c = input.country.toUpperCase();
          reasons = reasons.filter((r) => r.country?.toUpperCase() === c);
        }
        if (input.currency) {
          const cur = input.currency.toUpperCase();
          reasons = reasons.filter((r) => r.currency?.toUpperCase() === cur);
        }
        if (!reasons.length) return 'No transfer reasons found for the given filters.';
        const total = reasons.length;
        const shown = reasons.slice(0, REASONS_LIMIT);
        const body = shown
          .map((r) => `  [${r.country}/${r.currency}] ${r.code} — ${r.description}`)
          .join('\n');
        const note = total > shown.length ? `\n\n(Showing ${shown.length} of ${total}; refine with country/currency.)` : '';
        return `Transfer reasons (${total} match):\n\n${body}${note}`;
      },
    }),
    defineTool({
      name: 'create_payment',
      description:
        'Sends a payment from one of your accounts to a counterparty (payee). This moves money out of the account and is a write operation.',
      schema: createPaymentSchema,
      annotations: { title: 'Create payment', readOnlyHint: false, openWorldHint: true },
      handler: async (input, { client }) => {
        const receiver: Record<string, unknown> = { counterparty_id: input.counterparty_id };
        if (input.counterparty_account_id) receiver.account_id = input.counterparty_account_id;
        const payload: Record<string, unknown> = {
          request_id: input.request_id ?? uuidv4(),
          account_id: input.account_id,
          receiver,
          amount: input.amount,
          currency: input.currency.toUpperCase(),
        };
        if (input.reference) payload.reference = input.reference;
        const result = await client.createPayment(payload);
        return [
          'Payment submitted:',
          `  ID    : ${result.id}`,
          `  State : ${result.state}`,
          `  Amount: ${formatMoney(input.amount, input.currency.toUpperCase())}`,
        ].join('\n');
      },
    }),
    defineTool({
      name: 'transfer_between_accounts',
      description:
        'Transfers money between two of your own Revolut Business accounts. This moves money and is a write operation.',
      schema: transferSchema,
      annotations: { title: 'Transfer between accounts', readOnlyHint: false, openWorldHint: true },
      handler: async (input, { client }) => {
        const payload: Record<string, unknown> = {
          request_id: input.request_id ?? uuidv4(),
          source_account_id: input.source_account_id,
          target_account_id: input.target_account_id,
          amount: input.amount,
          currency: input.currency.toUpperCase(),
        };
        if (input.reference) payload.reference = input.reference;
        const result = await client.transfer(payload);
        return [
          'Transfer submitted:',
          `  ID    : ${result.id}`,
          `  State : ${result.state}`,
          `  Amount: ${formatMoney(input.amount, input.currency.toUpperCase())}`,
        ].join('\n');
      },
    }),
    defineTool({
      name: 'cancel_transaction',
      description:
        'Cancels a scheduled or pending transaction (payment/transfer) by ID. This is a destructive operation.',
      schema: cancelSchema,
      annotations: {
        title: 'Cancel transaction',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
      handler: async (input, { client }) => {
        await client.cancelTransaction(input.transactionId);
        return `Transaction ${input.transactionId} cancelled.`;
      },
    }),
  ],
};
