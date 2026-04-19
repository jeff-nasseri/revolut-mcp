import { z } from 'zod';
import { RevolutClient } from '../client/revolut-client.js';
import { OBTransaction } from '../types/revolut.js';

export const getTransactionsInputSchema = z.object({
  accountId: z.string().describe('The Revolut account ID'),
  fromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional()
    .describe('Start date (YYYY-MM-DD)'),
  toDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional()
    .describe('End date (YYYY-MM-DD)'),
  limit: z
    .number()
    .int()
    .positive()
    .max(500)
    .optional()
    .default(50)
    .describe('Maximum number of transactions to return (1–500, default 50)'),
});

export const getTransactionDetailInputSchema = z.object({
  accountId: z.string().describe('The Revolut account ID'),
  transactionId: z.string().describe('The transaction ID'),
});

function toIso(date: string, endOfDay = false): string {
  return endOfDay ? `${date}T23:59:59Z` : `${date}T00:00:00Z`;
}

function formatTransaction(tx: OBTransaction, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : '';
  const sign = tx.CreditDebitIndicator === 'Debit' ? '-' : '+';
  const amount = `${sign}${tx.Amount.Amount} ${tx.Amount.Currency}`;
  const date = tx.BookingDateTime.split('T')[0];
  const merchant = tx.MerchantDetails?.MerchantName;
  const description = tx.TransactionInformation;
  const label = merchant ?? description ?? 'Unknown';

  const lines = [
    `${prefix}[${tx.Status}] ${date}  ${amount.padEnd(20)} ${label}`,
    `   ID: ${tx.TransactionId}`,
  ];

  if (tx.TransactionReference) {
    lines.push(`   Ref: ${tx.TransactionReference}`);
  }

  if (tx.CurrencyExchange) {
    const fx = tx.CurrencyExchange;
    if (fx.ExchangeRate) {
      lines.push(
        `   FX: ${fx.SourceCurrency} → ${fx.TargetCurrency ?? ''} @ ${fx.ExchangeRate}`
      );
    }
  }

  return lines.join('\n');
}

export async function getTransactions(
  client: RevolutClient,
  input: z.infer<typeof getTransactionsInputSchema>
): Promise<string> {
  const params: { fromBookingDateTime?: string; toBookingDateTime?: string } = {};
  if (input.fromDate) params.fromBookingDateTime = toIso(input.fromDate);
  if (input.toDate) params.toBookingDateTime = toIso(input.toDate, true);

  const response = await client.getTransactions(input.accountId, params);
  let transactions = response.Data.Transaction ?? [];

  if (transactions.length === 0) return 'No transactions found for the given criteria.';

  transactions = transactions.slice(0, input.limit);

  const header = `Showing ${transactions.length} transaction(s) for account ${input.accountId}:`;
  const body = transactions.map((tx, i) => formatTransaction(tx, i)).join('\n\n');

  return `${header}\n\n${body}`;
}

export async function getTransactionDetail(
  client: RevolutClient,
  input: z.infer<typeof getTransactionDetailInputSchema>
): Promise<string> {
  const response = await client.getTransaction(input.accountId, input.transactionId);
  const transactions = response.Data.Transaction ?? [];

  if (transactions.length === 0) {
    return `Transaction ${input.transactionId} not found in account ${input.accountId}.`;
  }

  const tx = transactions[0];
  const sign = tx.CreditDebitIndicator === 'Debit' ? '-' : '+';

  const lines = [
    `Transaction Detail`,
    `==================`,
    `ID         : ${tx.TransactionId}`,
    `Status     : ${tx.Status}`,
    `Date       : ${tx.BookingDateTime}`,
    `Amount     : ${sign}${tx.Amount.Amount} ${tx.Amount.Currency}`,
    `Direction  : ${tx.CreditDebitIndicator}`,
  ];

  if (tx.ValueDateTime) lines.push(`Value Date : ${tx.ValueDateTime}`);
  if (tx.TransactionReference) lines.push(`Reference  : ${tx.TransactionReference}`);
  if (tx.TransactionInformation) lines.push(`Info       : ${tx.TransactionInformation}`);

  if (tx.MerchantDetails) {
    lines.push(`Merchant   : ${tx.MerchantDetails.MerchantName ?? 'N/A'}`);
    if (tx.MerchantDetails.MerchantCategoryCode) {
      lines.push(`MCC        : ${tx.MerchantDetails.MerchantCategoryCode}`);
    }
  }

  if (tx.CurrencyExchange) {
    const fx = tx.CurrencyExchange;
    lines.push(``, `Currency Exchange:`);
    if (fx.SourceCurrency) lines.push(`  Source   : ${fx.SourceCurrency}`);
    if (fx.TargetCurrency) lines.push(`  Target   : ${fx.TargetCurrency}`);
    if (fx.ExchangeRate) lines.push(`  Rate     : ${fx.ExchangeRate}`);
    if (fx.InstructedAmount) {
      lines.push(`  Instructed: ${fx.InstructedAmount.Amount} ${fx.InstructedAmount.Currency}`);
    }
  }

  if (tx.Balance) {
    lines.push(``, `Running Balance:`);
    const bSign = tx.Balance.CreditDebitIndicator === 'Debit' ? '-' : '';
    lines.push(`  ${tx.Balance.Type}: ${bSign}${tx.Balance.Amount.Amount} ${tx.Balance.Amount.Currency}`);
  }

  return lines.join('\n');
}
