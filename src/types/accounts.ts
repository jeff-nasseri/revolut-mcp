// Account and Balance types for Open Banking AISP

import { Amount, Links, Meta } from "./common.js";

// Account Access Consent

export type Permission =
  | "ReadAccountsBasic"
  | "ReadAccountsDetail"
  | "ReadBalances"
  | "ReadBeneficiariesBasic"
  | "ReadBeneficiariesDetail"
  | "ReadDirectDebits"
  | "ReadScheduledPaymentsBasic"
  | "ReadScheduledPaymentsDetail"
  | "ReadStandingOrdersBasic"
  | "ReadStandingOrdersDetail"
  | "ReadTransactionsBasic"
  | "ReadTransactionsDetail"
  | "ReadTransactionsCredits"
  | "ReadTransactionsDebits";

export type ConsentStatus =
  | "AwaitingAuthorisation"
  | "Authorised"
  | "Rejected"
  | "Revoked";

export interface OBReadConsentRequest {
  Data: {
    Permissions: Permission[];
    ExpirationDateTime?: string;
    TransactionFromDateTime?: string;
    TransactionToDateTime?: string;
  };
  Risk: Record<string, unknown>;
}

export interface OBReadConsentResponse {
  Data: {
    ConsentId: string;
    Status: ConsentStatus;
    StatusUpdateDateTime: string;
    CreationDateTime: string;
    Permissions: Permission[];
    ExpirationDateTime?: string;
    TransactionFromDateTime?: string;
    TransactionToDateTime?: string;
  };
  Risk: Record<string, unknown>;
  Links: Links;
  Meta: Meta;
}

// Accounts

export type AccountType = "Personal" | "Business";
export type AccountSubType = "CurrentAccount" | "Savings";

export interface AccountIdentifier {
  SchemeName: string;
  Identification: string;
  Name?: string;
  SecondaryIdentification?: string;
}

export interface Account {
  AccountId: string;
  Currency: string;
  AccountType: AccountType;
  AccountSubType: AccountSubType;
  Description?: string;
  Nickname?: string;
  Account?: AccountIdentifier[];
}

export interface OBReadAccountResponse {
  Data: {
    Account: Account[];
  };
  Links: Links;
  Meta: Meta;
}

// Balances

export type CreditDebitIndicator = "Credit" | "Debit";
export type BalanceType = "InterimAvailable" | "InterimBooked" | "ClosingAvailable" | "ClosingBooked" | "Expected" | "ForwardAvailable" | "Information" | "OpeningAvailable" | "OpeningBooked" | "PreviouslyClosedBooked";

export interface Balance {
  AccountId: string;
  Amount: Amount;
  CreditDebitIndicator: CreditDebitIndicator;
  Type: BalanceType;
  DateTime: string;
  CreditLine?: {
    Included: boolean;
    Amount?: Amount;
    Type?: string;
  }[];
}

export interface OBReadBalanceResponse {
  Data: {
    Balance: Balance[];
  };
  Links: Links;
  Meta: Meta;
}

// Beneficiaries

export interface Beneficiary {
  BeneficiaryId?: string;
  AccountId?: string;
  Reference?: string;
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

export interface OBReadBeneficiaryResponse {
  Data: {
    Beneficiary: Beneficiary[];
  };
  Links: Links;
  Meta: Meta;
}
