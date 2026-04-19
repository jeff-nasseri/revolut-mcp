// Revolut Open Banking API response shapes (OB UK 3.1 spec)

export interface OBAmount {
  Amount: string;
  Currency: string;
}

export interface OBAccount {
  AccountId: string;
  Currency: string;
  AccountType: 'Business' | 'Personal';
  AccountSubType:
    | 'ChargeCard'
    | 'CreditCard'
    | 'CurrentAccount'
    | 'EMoney'
    | 'Loan'
    | 'Mortgage'
    | 'PrePaidCard'
    | 'Savings';
  Description?: string;
  Nickname?: string;
  Account?: Array<{
    SchemeName: string;
    Identification: string;
    Name?: string;
    SecondaryIdentification?: string;
  }>;
}

export interface OBReadAccountResponse {
  Data: { Account: OBAccount[] };
  Links: { Self: string };
  Meta: { TotalPages: number };
}

export type BalanceType =
  | 'ClosingAvailable'
  | 'ClosingBooked'
  | 'Expected'
  | 'ForwardAvailable'
  | 'Information'
  | 'InterimAvailable'
  | 'InterimBooked'
  | 'OpeningAvailable'
  | 'OpeningBooked'
  | 'PreviouslyClosedBooked';

export interface OBBalance {
  AccountId: string;
  Amount: OBAmount;
  CreditDebitIndicator: 'Credit' | 'Debit';
  Type: BalanceType;
  DateTime: string;
}

export interface OBReadBalanceResponse {
  Data: { Balance: OBBalance[] };
  Links: { Self: string };
  Meta: { TotalPages: number };
}

export interface OBTransaction {
  AccountId: string;
  TransactionId: string;
  TransactionReference?: string;
  Amount: OBAmount;
  CreditDebitIndicator: 'Credit' | 'Debit';
  Status: 'Booked' | 'Pending';
  BookingDateTime: string;
  ValueDateTime?: string;
  TransactionInformation?: string;
  MerchantDetails?: {
    MerchantName?: string;
    MerchantCategoryCode?: string;
  };
  CurrencyExchange?: {
    SourceCurrency: string;
    TargetCurrency?: string;
    UnitCurrency?: string;
    ExchangeRate?: number;
    InstructedAmount?: OBAmount;
  };
  Balance?: {
    Amount: OBAmount;
    CreditDebitIndicator: 'Credit' | 'Debit';
    Type: string;
  };
  CreditorAgent?: { Identification?: string };
  DebtorAgent?: { Identification?: string };
}

export interface OBReadTransactionResponse {
  Data: { Transaction: OBTransaction[] };
  Links: {
    Self: string;
    First?: string;
    Prev?: string;
    Next?: string;
    Last?: string;
  };
  Meta: {
    TotalPages: number;
    FirstAvailableDateTime?: string;
    LastAvailableDateTime?: string;
  };
}

export interface OBConsentRequest {
  Data: {
    Permissions: string[];
    ExpirationDateTime?: string;
    TransactionFromDateTime?: string;
    TransactionToDateTime?: string;
  };
  Risk: Record<string, never>;
}

export interface OBConsentResponse {
  Data: {
    ConsentId: string;
    Status: 'AwaitingAuthorisation' | 'Authorised' | 'Rejected' | 'Revoked';
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Permissions: string[];
    ExpirationDateTime?: string;
    TransactionFromDateTime?: string;
    TransactionToDateTime?: string;
  };
  Risk: Record<string, never>;
  Links: { Self: string };
  Meta: { TotalPages: number };
}

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
  expiresAt: number;
  scope?: string;
}

export interface ExchangeRateResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}
