// Common types shared across the Open Banking API

export interface OBError {
  ErrorCode: string;
  Message: string;
  Path?: string;
  Url?: string;
}

export interface OBErrorResponse {
  Code: string;
  Id?: string;
  Message: string;
  Errors: OBError[];
}

export interface Links {
  Self: string;
  First?: string;
  Prev?: string;
  Next?: string;
  Last?: string;
}

export interface Meta {
  TotalPages?: number;
  FirstAvailableDateTime?: string;
  LastAvailableDateTime?: string;
}

export interface Amount {
  Amount: string;
  Currency: string;
}

export interface CreditorAccount {
  SchemeName: string;
  Identification: string;
  Name: string;
  SecondaryIdentification?: string;
}

export interface DebtorAccount {
  SchemeName: string;
  Identification: string;
  Name?: string;
  SecondaryIdentification?: string;
}

export interface RemittanceInformation {
  Unstructured?: string;
  Reference?: string;
}

export interface PostalAddress {
  AddressType?: string;
  Department?: string;
  SubDepartment?: string;
  StreetName?: string;
  BuildingNumber?: string;
  PostCode?: string;
  TownName?: string;
  CountrySubDivision?: string;
  Country?: string;
  AddressLine?: string[];
}

export type AccountScheme =
  | "UK.OBIE.SortCodeAccountNumber"
  | "UK.OBIE.IBAN"
  | "UK.OBIE.PAN"
  | "UK.OBIE.Paym"
  | string;
