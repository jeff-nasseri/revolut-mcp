import { z } from 'zod';
import axios from 'axios';
import { ExchangeRateResponse } from '../types/revolut.js';

const FRANKFURTER_BASE = 'https://api.frankfurter.app';

export const getExchangeRateInputSchema = z.object({
  baseCurrency: z
    .string()
    .length(3)
    .toUpperCase()
    .describe('ISO 4217 base currency code (e.g. USD, GBP, EUR)'),
  targetCurrencies: z
    .array(z.string().length(3).toUpperCase())
    .min(1)
    .max(30)
    .optional()
    .describe('List of target currency codes. Omit to get all available rates.'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional()
    .describe('Historical date (YYYY-MM-DD). Omit for latest rates.'),
});

export const convertCurrencyInputSchema = z.object({
  amount: z.number().positive().describe('Amount to convert'),
  fromCurrency: z.string().length(3).toUpperCase().describe('Source currency (e.g. GBP)'),
  toCurrency: z.string().length(3).toUpperCase().describe('Target currency (e.g. EUR)'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe('Historical date (YYYY-MM-DD). Omit for latest rate.'),
});

export async function getExchangeRate(
  input: z.infer<typeof getExchangeRateInputSchema>
): Promise<string> {
  const endpoint = input.date ? `/${input.date}` : '/latest';
  const params: Record<string, string> = { base: input.baseCurrency };
  if (input.targetCurrencies?.length) {
    params.symbols = input.targetCurrencies.join(',');
  }

  const response = await axios.get<ExchangeRateResponse>(`${FRANKFURTER_BASE}${endpoint}`, {
    params,
  });

  const { base, date, rates } = response.data;
  const label = input.date ? `Historical rates on ${date}` : `Latest rates (${date})`;

  const lines = [`${label} — Base: ${base}`, ''];
  const sorted = Object.entries(rates).sort(([a], [b]) => a.localeCompare(b));
  for (const [currency, rate] of sorted) {
    lines.push(`  ${currency}: ${rate.toFixed(6)}`);
  }

  lines.push('', 'Source: European Central Bank via Frankfurter API');
  return lines.join('\n');
}

export async function convertCurrency(
  input: z.infer<typeof convertCurrencyInputSchema>
): Promise<string> {
  const endpoint = input.date ? `/${input.date}` : '/latest';

  const response = await axios.get<ExchangeRateResponse>(`${FRANKFURTER_BASE}${endpoint}`, {
    params: {
      base: input.fromCurrency,
      symbols: input.toCurrency,
      amount: input.amount,
    },
  });

  const { date, rates, amount, base } = response.data;
  const converted = rates[input.toCurrency];

  if (converted === undefined) {
    return `Currency ${input.toCurrency} is not available.`;
  }

  const rate = converted / amount;
  const label = input.date ? `on ${date}` : `(latest, as of ${date})`;

  return [
    `Currency Conversion ${label}`,
    ``,
    `  ${amount} ${base}  =  ${converted.toFixed(4)} ${input.toCurrency}`,
    ``,
    `  Exchange rate: 1 ${base} = ${rate.toFixed(6)} ${input.toCurrency}`,
    ``,
    `Source: European Central Bank via Frankfurter API`,
  ].join('\n');
}
