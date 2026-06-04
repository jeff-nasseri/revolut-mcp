import { MoneyAmount } from '../types/revolut.js';

/** Format a monetary amount (major units) with thousands separators + currency. */
export function formatMoney(amount: number, currency: string): string {
  const n = Number(amount);
  const str = Number.isInteger(n)
    ? n.toLocaleString('en-US')
    : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${str} ${currency}`;
}

export function formatMoneyObject(money?: MoneyAmount): string {
  if (!money) return 'N/A';
  return formatMoney(money.amount, money.currency);
}

/** Trim an ISO 8601 timestamp to the date part, leaving other strings intact. */
export function dateOnly(iso?: string): string {
  if (!iso) return '';
  return iso.split('T')[0];
}

/** Title-case a snake_case / lowercase token, e.g. `card_payment` → `Card Payment`. */
export function humanize(value?: string): string {
  if (!value) return '';
  return value
    .split(/[_\s]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** Join non-empty parts with a separator. */
export function joinParts(parts: Array<string | undefined | null | false>, sep = ', '): string {
  return parts.filter((p): p is string => Boolean(p)).join(sep);
}
