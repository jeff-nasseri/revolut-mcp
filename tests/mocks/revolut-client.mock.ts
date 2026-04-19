import {
  OBReadAccountResponse,
  OBReadBalanceResponse,
  OBReadTransactionResponse,
} from '../../src/types/revolut.js';

export const mockAccountsResponse: OBReadAccountResponse = {
  Data: {
    Account: [
      {
        AccountId: 'acc-001',
        Currency: 'GBP',
        AccountType: 'Personal',
        AccountSubType: 'CurrentAccount',
        Nickname: 'Main GBP',
      },
      {
        AccountId: 'acc-002',
        Currency: 'EUR',
        AccountType: 'Personal',
        AccountSubType: 'Savings',
        Nickname: 'EUR Savings',
      },
    ],
  },
  Links: { Self: 'https://sandbox-oba.revolut.com/accounts' },
  Meta: { TotalPages: 1 },
};

export const mockBalancesResponse: OBReadBalanceResponse = {
  Data: {
    Balance: [
      {
        AccountId: 'acc-001',
        Amount: { Amount: '1234.56', Currency: 'GBP' },
        CreditDebitIndicator: 'Credit',
        Type: 'InterimAvailable',
        DateTime: '2024-01-15T10:00:00Z',
      },
      {
        AccountId: 'acc-001',
        Amount: { Amount: '1300.00', Currency: 'GBP' },
        CreditDebitIndicator: 'Credit',
        Type: 'InterimBooked',
        DateTime: '2024-01-15T10:00:00Z',
      },
    ],
  },
  Links: { Self: 'https://sandbox-oba.revolut.com/accounts/acc-001/balances' },
  Meta: { TotalPages: 1 },
};

export const mockTransactionsResponse: OBReadTransactionResponse = {
  Data: {
    Transaction: [
      {
        AccountId: 'acc-001',
        TransactionId: 'txn-001',
        TransactionReference: 'REF001',
        Amount: { Amount: '45.00', Currency: 'GBP' },
        CreditDebitIndicator: 'Debit',
        Status: 'Booked',
        BookingDateTime: '2024-01-14T09:30:00Z',
        TransactionInformation: 'Coffee shop',
        MerchantDetails: { MerchantName: 'Starbucks', MerchantCategoryCode: '5812' },
      },
      {
        AccountId: 'acc-001',
        TransactionId: 'txn-002',
        Amount: { Amount: '2500.00', Currency: 'GBP' },
        CreditDebitIndicator: 'Credit',
        Status: 'Booked',
        BookingDateTime: '2024-01-13T08:00:00Z',
        TransactionInformation: 'Salary',
        CurrencyExchange: {
          SourceCurrency: 'EUR',
          TargetCurrency: 'GBP',
          ExchangeRate: 0.856,
          InstructedAmount: { Amount: '2920.00', Currency: 'EUR' },
        },
      },
    ],
  },
  Links: { Self: 'https://sandbox-oba.revolut.com/accounts/acc-001/transactions' },
  Meta: { TotalPages: 1 },
};

export const mockSingleTransactionResponse: OBReadTransactionResponse = {
  Data: { Transaction: [mockTransactionsResponse.Data.Transaction[0]] },
  Links: { Self: 'https://sandbox-oba.revolut.com/accounts/acc-001/transactions/txn-001' },
  Meta: { TotalPages: 1 },
};

export function createMockRevolutClient() {
  return {
    getAccounts: jest.fn().mockResolvedValue(mockAccountsResponse),
    getAccountBalances: jest.fn().mockResolvedValue(mockBalancesResponse),
    getTransactions: jest.fn().mockResolvedValue(mockTransactionsResponse),
    getTransaction: jest.fn().mockResolvedValue(mockSingleTransactionResponse),
  };
}
