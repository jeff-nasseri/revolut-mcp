// Payment types for Open Banking PISP

import {
  Amount,
  CreditorAccount,
  DebtorAccount,
  RemittanceInformation,
  PostalAddress,
  Links,
  Meta,
} from "./common.js";

// Common payment types

export type PaymentConsentStatus =
  | "AwaitingAuthorisation"
  | "Authorised"
  | "Consumed"
  | "Rejected";

export type PaymentStatus =
  | "AcceptedCreditSettlementCompleted"
  | "AcceptedSettlementCompleted"
  | "AcceptedSettlementInProcess"
  | "AcceptedWithoutPosting"
  | "Pending"
  | "Rejected";

export interface Risk {
  PaymentContextCode?: string;
  MerchantCategoryCode?: string;
  MerchantCustomerIdentification?: string;
  DeliveryAddress?: {
    AddressLine?: string[];
    StreetName?: string;
    BuildingNumber?: string;
    PostCode?: string;
    TownName: string;
    CountrySubDivision?: string;
    Country: string;
  };
}

// Domestic Payment

export interface DomesticPaymentInitiation {
  InstructionIdentification: string;
  EndToEndIdentification: string;
  LocalInstrument?: string;
  InstructedAmount: Amount;
  DebtorAccount?: DebtorAccount;
  CreditorAccount: CreditorAccount;
  CreditorPostalAddress?: PostalAddress;
  RemittanceInformation?: RemittanceInformation;
}

export interface OBWriteDomesticConsentRequest {
  Data: {
    Initiation: DomesticPaymentInitiation;
  };
  Risk: Risk;
}

export interface OBWriteDomesticConsentResponse {
  Data: {
    ConsentId: string;
    Status: PaymentConsentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Initiation: DomesticPaymentInitiation;
  };
  Risk: Risk;
  Links: Links;
  Meta: Meta;
}

export interface OBWriteDomesticRequest {
  Data: {
    ConsentId: string;
    Initiation: DomesticPaymentInitiation;
  };
  Risk: Risk;
}

export interface OBWriteDomesticResponse {
  Data: {
    DomesticPaymentId: string;
    ConsentId: string;
    Status: PaymentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Initiation: DomesticPaymentInitiation;
  };
  Links: Links;
  Meta: Meta;
}

export interface OBWriteFundsConfirmationResponse {
  Data: {
    FundsAvailableResult: {
      FundsAvailableDateTime: string;
      FundsAvailable: boolean;
    };
  };
  Links: Links;
  Meta: Meta;
}

// Domestic Scheduled Payment

export interface DomesticScheduledPaymentInitiation {
  InstructionIdentification: string;
  EndToEndIdentification?: string;
  LocalInstrument?: string;
  RequestedExecutionDateTime: string;
  InstructedAmount: Amount;
  DebtorAccount?: DebtorAccount;
  CreditorAccount: CreditorAccount;
  CreditorPostalAddress?: PostalAddress;
  RemittanceInformation?: RemittanceInformation;
}

export interface OBWriteDomesticScheduledConsentRequest {
  Data: {
    Permission: "Create";
    Initiation: DomesticScheduledPaymentInitiation;
  };
  Risk: Risk;
}

export interface OBWriteDomesticScheduledConsentResponse {
  Data: {
    ConsentId: string;
    Status: PaymentConsentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Permission: "Create";
    Initiation: DomesticScheduledPaymentInitiation;
  };
  Risk: Risk;
  Links: Links;
  Meta: Meta;
}

export interface OBWriteDomesticScheduledRequest {
  Data: {
    ConsentId: string;
    Initiation: DomesticScheduledPaymentInitiation;
  };
  Risk: Risk;
}

export interface OBWriteDomesticScheduledResponse {
  Data: {
    DomesticScheduledPaymentId: string;
    ConsentId: string;
    Status: PaymentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Initiation: DomesticScheduledPaymentInitiation;
  };
  Links: Links;
  Meta: Meta;
}

// Domestic Standing Order

export interface DomesticStandingOrderInitiation {
  Frequency: string;
  Reference?: string;
  NumberOfPayments?: string;
  FirstPaymentDateTime: string;
  RecurringPaymentDateTime?: string;
  FinalPaymentDateTime?: string;
  FirstPaymentAmount: Amount;
  RecurringPaymentAmount?: Amount;
  FinalPaymentAmount?: Amount;
  DebtorAccount?: DebtorAccount;
  CreditorAccount: CreditorAccount;
}

export interface OBWriteDomesticStandingOrderConsentRequest {
  Data: {
    Permission: "Create";
    Initiation: DomesticStandingOrderInitiation;
  };
  Risk: Risk;
}

export interface OBWriteDomesticStandingOrderConsentResponse {
  Data: {
    ConsentId: string;
    Status: PaymentConsentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Permission: "Create";
    Initiation: DomesticStandingOrderInitiation;
  };
  Risk: Risk;
  Links: Links;
  Meta: Meta;
}

export interface OBWriteDomesticStandingOrderRequest {
  Data: {
    ConsentId: string;
    Initiation: DomesticStandingOrderInitiation;
  };
  Risk: Risk;
}

export interface OBWriteDomesticStandingOrderResponse {
  Data: {
    DomesticStandingOrderId: string;
    ConsentId: string;
    Status: PaymentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Initiation: DomesticStandingOrderInitiation;
  };
  Links: Links;
  Meta: Meta;
}

// International Payment

export interface InternationalPaymentInitiation {
  InstructionIdentification: string;
  EndToEndIdentification: string;
  LocalInstrument?: string;
  InstructionPriority?: "Normal" | "Urgent";
  Purpose?: string;
  ChargeBearer?: "BorneByCreditor" | "BorneByDebtor" | "FollowingServiceLevel" | "Shared";
  CurrencyOfTransfer: string;
  InstructedAmount: Amount;
  ExchangeRateInformation?: {
    UnitCurrency: string;
    ExchangeRate?: number;
    RateType: "Actual" | "Agreed" | "Indicative";
    ContractIdentification?: string;
  };
  DebtorAccount?: DebtorAccount;
  Creditor?: {
    Name?: string;
    PostalAddress?: PostalAddress;
  };
  CreditorAgent?: {
    SchemeName?: string;
    Identification?: string;
  };
  CreditorAccount: CreditorAccount;
  RemittanceInformation?: RemittanceInformation;
}

export interface OBWriteInternationalConsentRequest {
  Data: {
    Initiation: InternationalPaymentInitiation;
  };
  Risk: Risk;
}

export interface OBWriteInternationalConsentResponse {
  Data: {
    ConsentId: string;
    Status: PaymentConsentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Initiation: InternationalPaymentInitiation;
  };
  Risk: Risk;
  Links: Links;
  Meta: Meta;
}

export interface OBWriteInternationalRequest {
  Data: {
    ConsentId: string;
    Initiation: InternationalPaymentInitiation;
  };
  Risk: Risk;
}

export interface OBWriteInternationalResponse {
  Data: {
    InternationalPaymentId: string;
    ConsentId: string;
    Status: PaymentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Initiation: InternationalPaymentInitiation;
  };
  Links: Links;
  Meta: Meta;
}

// International Scheduled Payment

export interface InternationalScheduledPaymentInitiation {
  InstructionIdentification: string;
  EndToEndIdentification?: string;
  LocalInstrument?: string;
  InstructionPriority?: "Normal" | "Urgent";
  Purpose?: string;
  ChargeBearer?: "BorneByCreditor" | "BorneByDebtor" | "FollowingServiceLevel" | "Shared";
  RequestedExecutionDateTime: string;
  CurrencyOfTransfer: string;
  InstructedAmount: Amount;
  ExchangeRateInformation?: {
    UnitCurrency: string;
    ExchangeRate?: number;
    RateType: "Actual" | "Agreed" | "Indicative";
    ContractIdentification?: string;
  };
  DebtorAccount?: DebtorAccount;
  Creditor?: {
    Name?: string;
    PostalAddress?: PostalAddress;
  };
  CreditorAgent?: {
    SchemeName?: string;
    Identification?: string;
  };
  CreditorAccount: CreditorAccount;
  RemittanceInformation?: RemittanceInformation;
}

export interface OBWriteInternationalScheduledConsentRequest {
  Data: {
    Permission: "Create";
    Initiation: InternationalScheduledPaymentInitiation;
  };
  Risk: Risk;
}

export interface OBWriteInternationalScheduledConsentResponse {
  Data: {
    ConsentId: string;
    Status: PaymentConsentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Permission: "Create";
    Initiation: InternationalScheduledPaymentInitiation;
  };
  Risk: Risk;
  Links: Links;
  Meta: Meta;
}

export interface OBWriteInternationalScheduledRequest {
  Data: {
    ConsentId: string;
    Initiation: InternationalScheduledPaymentInitiation;
  };
  Risk: Risk;
}

export interface OBWriteInternationalScheduledResponse {
  Data: {
    InternationalScheduledPaymentId: string;
    ConsentId: string;
    Status: PaymentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Initiation: InternationalScheduledPaymentInitiation;
  };
  Links: Links;
  Meta: Meta;
}

// International Standing Order

export interface InternationalStandingOrderInitiation {
  Frequency: string;
  Reference?: string;
  NumberOfPayments?: string;
  FirstPaymentDateTime: string;
  FinalPaymentDateTime?: string;
  Purpose?: string;
  ChargeBearer?: "BorneByCreditor" | "BorneByDebtor" | "FollowingServiceLevel" | "Shared";
  CurrencyOfTransfer: string;
  InstructedAmount: Amount;
  DebtorAccount?: DebtorAccount;
  Creditor?: {
    Name?: string;
    PostalAddress?: PostalAddress;
  };
  CreditorAgent?: {
    SchemeName?: string;
    Identification?: string;
  };
  CreditorAccount: CreditorAccount;
}

export interface OBWriteInternationalStandingOrderConsentRequest {
  Data: {
    Permission: "Create";
    Initiation: InternationalStandingOrderInitiation;
  };
  Risk: Risk;
}

export interface OBWriteInternationalStandingOrderConsentResponse {
  Data: {
    ConsentId: string;
    Status: PaymentConsentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Permission: "Create";
    Initiation: InternationalStandingOrderInitiation;
  };
  Risk: Risk;
  Links: Links;
  Meta: Meta;
}

export interface OBWriteInternationalStandingOrderRequest {
  Data: {
    ConsentId: string;
    Initiation: InternationalStandingOrderInitiation;
  };
  Risk: Risk;
}

export interface OBWriteInternationalStandingOrderResponse {
  Data: {
    InternationalStandingOrderId: string;
    ConsentId: string;
    Status: PaymentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Initiation: InternationalStandingOrderInitiation;
  };
  Links: Links;
  Meta: Meta;
}

// File Payment

export interface FilePaymentInitiation {
  FileType: string;
  FileHash: string;
  FileReference?: string;
  NumberOfTransactions?: string;
  ControlSum?: number;
  RequestedExecutionDateTime?: string;
  LocalInstrument?: string;
  DebtorAccount?: DebtorAccount;
  RemittanceInformation?: RemittanceInformation;
}

export interface OBWriteFileConsentRequest {
  Data: {
    Initiation: FilePaymentInitiation;
  };
}

export interface OBWriteFileConsentResponse {
  Data: {
    ConsentId: string;
    Status: PaymentConsentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Initiation: FilePaymentInitiation;
  };
  Links: Links;
  Meta: Meta;
}

export interface OBWriteFileRequest {
  Data: {
    ConsentId: string;
    Initiation: FilePaymentInitiation;
  };
}

export interface OBWriteFileResponse {
  Data: {
    FilePaymentId: string;
    ConsentId: string;
    Status: PaymentStatus;
    CreationDateTime: string;
    StatusUpdateDateTime: string;
    Initiation: FilePaymentInitiation;
  };
  Links: Links;
  Meta: Meta;
}
