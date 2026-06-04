// Revolut Business API response shapes (sandbox-b2b.revolut.com / b2b.revolut.com).
// Monetary amounts are expressed in the major unit of the currency (e.g. 28900 = 28,900.00 GBP).

export type AccountState = 'active' | 'inactive' | string;

export interface RevolutAccount {
  id: string;
  name?: string;
  balance: number;
  currency: string;
  state: AccountState;
  public: boolean;
  created_at: string;
  updated_at: string;
}

export interface BeneficiaryAddress {
  street_line1?: string;
  street_line2?: string;
  region?: string;
  city?: string;
  country?: string;
  postcode?: string;
}

export interface EstimatedTime {
  unit: string;
  min?: number;
  max?: number;
}

export interface BankDetail {
  // Local scheme fields
  account_no?: string;
  sort_code?: string;
  routing_number?: string;
  // IBAN scheme fields
  iban?: string;
  bic?: string;
  bank_country?: string;
  // Shared
  beneficiary?: string;
  beneficiary_address?: BeneficiaryAddress;
  pooled?: boolean;
  unique_reference?: string;
  schemes?: string[];
  estimated_time?: EstimatedTime;
}

export interface TransactionCounterparty {
  id?: string;
  account_id?: string;
  account_type?: string;
}

export interface TransactionLeg {
  leg_id: string;
  account_id: string;
  counterparty?: TransactionCounterparty;
  amount: number;
  currency: string;
  bill_amount?: number;
  bill_currency?: string;
  description?: string;
  balance?: number;
}

export type TransactionType =
  | 'atm'
  | 'card_payment'
  | 'card_refund'
  | 'card_chargeback'
  | 'card_credit'
  | 'exchange'
  | 'transfer'
  | 'loan'
  | 'fee'
  | 'refund'
  | 'topup'
  | 'topup_return'
  | 'tax'
  | 'tax_refund'
  | string;

export type TransactionState =
  | 'created'
  | 'pending'
  | 'completed'
  | 'declined'
  | 'failed'
  | 'reverted'
  | string;

export interface TransactionMerchant {
  name?: string;
  city?: string;
  category_code?: string;
  country?: string;
}

export interface RevolutTransaction {
  id: string;
  type: TransactionType;
  state: TransactionState;
  request_id?: string;
  reason_code?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  scheduled_for?: string;
  reference?: string;
  legs: TransactionLeg[];
  card?: Record<string, unknown>;
  merchant?: TransactionMerchant;
}

export interface CounterpartyAccount {
  id: string;
  type?: string;
  name?: string;
  currency?: string;
  iban?: string;
  bic?: string;
  account_no?: string;
  sort_code?: string;
  routing_number?: string;
  bank_country?: string;
  recipient_charges?: string;
}

export interface Counterparty {
  id: string;
  name: string;
  state: string;
  created_at: string;
  updated_at: string;
  profile_type?: string;
  country?: string;
  revtag?: string;
  phone?: string;
  accounts?: CounterpartyAccount[];
}

export interface MoneyAmount {
  amount: number;
  currency: string;
}

export interface ExchangeRate {
  from: MoneyAmount;
  to: MoneyAmount;
  rate: number;
  fee: MoneyAmount;
  rate_date: string;
}

export interface TransferReason {
  country: string;
  currency: string;
  code: string;
  description: string;
}

export interface PaymentDraftSummary {
  id: string;
  title?: string;
  state?: string;
  created_at?: string;
  scheduled_for?: string;
}

export interface PaymentDraftsResponse {
  payment_orders: PaymentDraftSummary[];
}

export interface TeamMember {
  id: string;
  email?: string;
  role_id?: string;
  state?: string;
  created_at?: string;
  updated_at?: string;
  first_name?: string;
  last_name?: string;
}

// --- Write operation results ---

export interface PaymentResult {
  id: string;
  state: string;
  created_at?: string;
  completed_at?: string;
  [key: string]: unknown;
}

export type TransferResult = PaymentResult;

export interface ExchangeResult {
  id: string;
  state?: string;
  [key: string]: unknown;
}

// --- Authentication ---

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt: number;
  scope?: string;
}
