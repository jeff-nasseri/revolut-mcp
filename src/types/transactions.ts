// Transaction, DirectDebit, and StandingOrder types for Open Banking

import { Amount, Links, Meta } from "./common.js";

export type CreditDebitIndicator = "Credit" | "Debit";

// Transactions

export type TransactionStatus = "Booked" | "Pending";

export interface Transaction {
  AccountId: string;
  TransactionId?: string;
  TransactionReference?: string;
  Amount: Amount;
  CreditDebitIndicator: CreditDebitIndicator;
  Status: TransactionStatus;
  BookingDateTime: string;
  ValueDateTime?: string;
  TransactionInformation?: string;
  AddressLine?: string;
  BankTransactionCode?: {
    Code: string;
    SubCode: string;
  };
  ProprietaryBankTransactionCode?: {
    Code: string;
    Issuer?: string;
  };
  CurrencyExchange?: {
    SourceCurrency: string;
    TargetCurrency?: string;
    UnitCurrency?: string;
    ExchangeRate: number;
    ContractIdentification?: string;
    QuotationDate?: string;
    InstructedAmount?: Amount;
  };
  CreditorAgent?: {
    SchemeName?: string;
    Identification?: string;
  };
  CreditorAccount?: {
    SchemeName?: string;
    Identification?: string;
    Name?: string;
    SecondaryIdentification?: string;
  };
  DebtorAgent?: {
    SchemeName?: string;
    Identification?: string;
  };
  DebtorAccount?: {
    SchemeName?: string;
    Identification?: string;
    Name?: string;
    SecondaryIdentification?: string;
  };
  CardInstrument?: {
    CardSchemeName: string;
    AuthorisationType?: string;
    Name?: string;
    Identification?: string;
  };
  Balance?: {
    Amount: Amount;
    CreditDebitIndicator: CreditDebitIndicator;
    Type: string;
  };
  MerchantDetails?: {
    MerchantName?: string;
    MerchantCategoryCode?: string;
  };
  SupplementaryData?: Record<string, unknown>;
}

export interface OBReadTransactionResponse {
  Data: {
    Transaction: Transaction[];
  };
  Links: Links;
  Meta: Meta;
}

// Direct Debits

export interface DirectDebit {
  AccountId: string;
  DirectDebitId?: string;
  MandateIdentification: string;
  DirectDebitStatusCode?: string;
  Name: string;
  PreviousPaymentDateTime?: string;
  PreviousPaymentAmount?: Amount;
}

export interface OBReadDirectDebitResponse {
  Data: {
    DirectDebit: DirectDebit[];
  };
  Links: Links;
  Meta: Meta;
}

// Standing Orders

export interface StandingOrder {
  AccountId: string;
  StandingOrderId?: string;
  Frequency: string;
  Reference?: string;
  FirstPaymentDateTime?: string;
  NextPaymentDateTime?: string;
  FinalPaymentDateTime?: string;
  StandingOrderStatusCode?: string;
  FirstPaymentAmount?: Amount;
  NextPaymentAmount?: Amount;
  FinalPaymentAmount?: Amount;
  CreditorAgent?: {
    SchemeName?: string;
    Identification?: string;
  };
  CreditorAccount?: {
    SchemeName: string;
    Identification: string;
    Name?: string;
    SecondaryIdentification?: string;
  };
}

export interface OBReadStandingOrderResponse {
  Data: {
    StandingOrder: StandingOrder[];
  };
  Links: Links;
  Meta: Meta;
}
