import { getTransactions, getTransactionDetail } from '../src/tools/transaction-tools.js';
import {
  createMockRevolutClient,
  mockTransactionsResponse,
} from './mocks/revolut-client.mock.js';
import { RevolutClient } from '../src/client/revolut-client.js';

describe('transaction-tools', () => {
  let mockClient: ReturnType<typeof createMockRevolutClient>;

  beforeEach(() => {
    mockClient = createMockRevolutClient();
  });

  describe('getTransactions', () => {
    it('returns formatted transaction list', async () => {
      const result = await getTransactions(mockClient as unknown as RevolutClient, {
        accountId: 'acc-001',
        limit: 50,
      });

      expect(mockClient.getTransactions).toHaveBeenCalledWith('acc-001', {});
      expect(result).toContain('acc-001');
      expect(result).toContain('txn-001');
      expect(result).toContain('txn-002');
      expect(result).toContain('Starbucks');
      expect(result).toContain('-45.00 GBP');
      expect(result).toContain('+2500.00 GBP');
    });

    it('passes date range params to client', async () => {
      await getTransactions(mockClient as unknown as RevolutClient, {
        accountId: 'acc-001',
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
        limit: 50,
      });

      expect(mockClient.getTransactions).toHaveBeenCalledWith('acc-001', {
        fromBookingDateTime: '2024-01-01T00:00:00Z',
        toBookingDateTime: '2024-01-31T23:59:59Z',
      });
    });

    it('respects limit parameter', async () => {
      const manyTransactions = Array.from({ length: 100 }, (_, i) => ({
        ...mockTransactionsResponse.Data.Transaction[0],
        TransactionId: `txn-${i}`,
      }));
      mockClient.getTransactions.mockResolvedValue({
        ...mockTransactionsResponse,
        Data: { Transaction: manyTransactions },
      });

      const result = await getTransactions(mockClient as unknown as RevolutClient, {
        accountId: 'acc-001',
        limit: 5,
      });

      expect(result).toContain('5 transaction(s)');
    });

    it('returns no transactions message for empty result', async () => {
      mockClient.getTransactions.mockResolvedValue({
        ...mockTransactionsResponse,
        Data: { Transaction: [] },
      });

      const result = await getTransactions(mockClient as unknown as RevolutClient, {
        accountId: 'acc-001',
        limit: 50,
      });

      expect(result).toBe('No transactions found for the given criteria.');
    });

    it('shows currency exchange info for FX transactions', async () => {
      const result = await getTransactions(mockClient as unknown as RevolutClient, {
        accountId: 'acc-001',
        limit: 50,
      });

      expect(result).toContain('EUR');
      expect(result).toContain('0.856');
    });
  });

  describe('getTransactionDetail', () => {
    it('returns full transaction detail', async () => {
      const result = await getTransactionDetail(mockClient as unknown as RevolutClient, {
        accountId: 'acc-001',
        transactionId: 'txn-001',
      });

      expect(mockClient.getTransaction).toHaveBeenCalledWith('acc-001', 'txn-001');
      expect(result).toContain('txn-001');
      expect(result).toContain('Booked');
      expect(result).toContain('-45.00 GBP');
      expect(result).toContain('Starbucks');
      expect(result).toContain('5812');
      expect(result).toContain('REF001');
    });

    it('returns not found message for missing transaction', async () => {
      mockClient.getTransaction.mockResolvedValue({
        ...mockTransactionsResponse,
        Data: { Transaction: [] },
      });

      const result = await getTransactionDetail(mockClient as unknown as RevolutClient, {
        accountId: 'acc-001',
        transactionId: 'txn-999',
      });

      expect(result).toContain('not found');
      expect(result).toContain('txn-999');
    });
  });
});
