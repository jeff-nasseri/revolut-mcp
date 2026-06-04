import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { defineTool, Scope, ToolContext } from '../../utils/tool.js';
import { formatMoney } from '../../utils/format.js';

const topupSchema = z.object({
  account_id: z.string().min(1).describe('Account ID (UUID) to top up'),
  amount: z.number().positive().describe('Amount to add'),
  currency: z.string().length(3).describe('Currency (ISO 4217) — must match the account currency'),
  reference: z.string().optional().describe('Optional reference for the top-up'),
  state: z
    .enum(['completed', 'pending', 'failed', 'reverted'])
    .optional()
    .describe('Simulated resulting state (default: completed)'),
  request_id: z.string().optional().describe('Idempotency key; a UUID is generated automatically if omitted'),
});

const stateSchema = z.object({
  transactionId: z.string().min(1).describe('The transaction ID (UUID) to update'),
  action: z
    .enum(['complete', 'revert', 'decline', 'fail'])
    .describe('State transition to simulate on the transaction'),
});

function ensureSandbox(ctx: ToolContext): string | null {
  if (ctx.config.environment !== 'sandbox') {
    return 'This tool is only available in the sandbox environment (REVOLUT_ENVIRONMENT=sandbox).';
  }
  return null;
}

export const sandboxScope: Scope = {
  name: 'sandbox',
  description: 'Sandbox-only simulation helpers for generating and driving test data.',
  tools: [
    defineTool({
      name: 'simulate_topup',
      description:
        'Sandbox only. Tops up an account with simulated funds so you have test data to work with.',
      schema: topupSchema,
      annotations: { title: 'Simulate top-up', readOnlyHint: false, openWorldHint: true },
      handler: async (input, ctx) => {
        const guard = ensureSandbox(ctx);
        if (guard) return guard;
        const payload: Record<string, unknown> = {
          request_id: input.request_id ?? uuidv4(),
          account_id: input.account_id,
          amount: input.amount,
          currency: input.currency.toUpperCase(),
        };
        if (input.reference) payload.reference = input.reference;
        if (input.state) payload.state = input.state;
        const result = await ctx.client.sandboxTopup(payload);
        const id = (result as { id?: string }).id ?? '(unknown)';
        const state = (result as { state?: string }).state ?? input.state ?? 'completed';
        return [
          'Sandbox top-up submitted:',
          `  ID     : ${id}`,
          `  State  : ${state}`,
          `  Amount : ${formatMoney(input.amount, input.currency.toUpperCase())}`,
        ].join('\n');
      },
    }),
    defineTool({
      name: 'simulate_transaction_state',
      description:
        'Sandbox only. Drives a transfer/payment transaction into a target state (complete, revert, decline, or fail) for testing state transitions.',
      schema: stateSchema,
      annotations: { title: 'Simulate transaction state', readOnlyHint: false, openWorldHint: true },
      handler: async (input, ctx) => {
        const guard = ensureSandbox(ctx);
        if (guard) return guard;
        await ctx.client.sandboxSetTransactionState(input.transactionId, input.action);
        return `Transaction ${input.transactionId} driven to "${input.action}" (sandbox).`;
      },
    }),
  ],
};
