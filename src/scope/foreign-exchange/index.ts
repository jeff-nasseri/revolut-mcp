import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { defineTool, Scope } from '../../utils/tool.js';
import { formatMoney, formatMoneyObject } from '../../utils/format.js';

const rateSchema = z.object({
  from: z.string().length(3).describe('Source currency (ISO 4217), e.g. GBP'),
  to: z.string().length(3).describe('Target currency (ISO 4217), e.g. USD'),
  amount: z
    .number()
    .positive()
    .optional()
    .describe('Amount of the source currency to quote (defaults to 1 unit if omitted)'),
});

const exchangeSchema = z.object({
  from_account_id: z.string().min(1).describe('Source account ID (UUID) to debit'),
  to_account_id: z.string().min(1).describe('Target account ID (UUID) to credit'),
  from_currency: z.string().length(3).describe('Source currency (ISO 4217)'),
  to_currency: z.string().length(3).describe('Target currency (ISO 4217)'),
  amount: z.number().positive().describe('Amount to exchange'),
  amount_side: z
    .enum(['from', 'to'])
    .optional()
    .default('from')
    .describe('Whether `amount` is the sell (from) amount or the buy (to) amount'),
  reference: z.string().optional().describe('Optional reference shown on the exchange'),
  request_id: z
    .string()
    .optional()
    .describe('Idempotency key; a UUID is generated automatically if omitted'),
});

export const foreignExchangeScope: Scope = {
  name: 'foreign-exchange',
  description: 'Live exchange rates and currency exchange between your own accounts.',
  tools: [
    defineTool({
      name: 'get_exchange_rate',
      description:
        "Gets Revolut's live exchange rate between two currencies, including the converted amount and the fee that would apply.",
      schema: rateSchema,
      annotations: { title: 'Get exchange rate', readOnlyHint: true, openWorldHint: true },
      handler: async (input, { client }) => {
        const rate = await client.getRate(
          input.from.toUpperCase(),
          input.to.toUpperCase(),
          input.amount
        );
        return [
          `Exchange rate (as of ${rate.rate_date}):`,
          '',
          `  ${formatMoneyObject(rate.from)}  =  ${formatMoneyObject(rate.to)}`,
          `  Rate: 1 ${rate.from.currency} = ${rate.rate.toFixed(6)} ${rate.to.currency}`,
          `  Fee : ${formatMoneyObject(rate.fee)}`,
        ].join('\n');
      },
    }),
    defineTool({
      name: 'exchange_currency',
      description:
        'Exchanges currency between two of your own accounts at the current rate. This moves money and is a write operation.',
      schema: exchangeSchema,
      annotations: { title: 'Exchange currency', readOnlyHint: false, openWorldHint: true },
      handler: async (input, { client }) => {
        const fixFrom = input.amount_side === 'from';
        const payload: Record<string, unknown> = {
          request_id: input.request_id ?? uuidv4(),
          from: {
            account_id: input.from_account_id,
            currency: input.from_currency.toUpperCase(),
            ...(fixFrom ? { amount: input.amount } : {}),
          },
          to: {
            account_id: input.to_account_id,
            currency: input.to_currency.toUpperCase(),
            ...(fixFrom ? {} : { amount: input.amount }),
          },
        };
        if (input.reference) payload.reference = input.reference;
        const result = await client.exchange(payload);
        return [
          'Exchange submitted:',
          `  ID    : ${result.id}`,
          `  State : ${result.state ?? 'n/a'}`,
          `  ${formatMoney(input.amount, (fixFrom ? input.from_currency : input.to_currency).toUpperCase())} (${input.amount_side} side)`,
        ].join('\n');
      },
    }),
  ],
};
