import { transactionsScope } from '../src/scope/transactions/index.js';
import {
  callTool,
  createMockClient,
  getTool,
  mockContext,
  mockTransactions,
} from './mocks/revolut-client.mock.js';

describe('transactions scope', () => {
  let client: ReturnType<typeof createMockClient>;
  let ctx: ReturnType<typeof mockContext>;

  beforeEach(() => {
    client = createMockClient();
    ctx = mockContext(client);
  });

  describe('get_transactions', () => {
    it('formats the transaction list with legs and running balances', async () => {
      const result = await callTool(getTool(transactionsScope, 'get_transactions'), { count: 100 }, ctx);
      expect(result).toContain('2 transaction(s)');
      expect(result).toContain('txn-1');
      expect(result).toContain('Transfer');
      expect(result).toContain('210 GBP');
      expect(result).toContain('running balance: 28,690 GBP');
      expect(result).toContain('To Acme Corp.');
    });

    it('passes filter params through to the client', async () => {
      await callTool(
        getTool(transactionsScope, 'get_transactions'),
        { account: 'acc-gbp', from: '2026-05-01', to: '2026-05-31', type: 'transfer', count: 10 },
        ctx
      );
      expect(client.getTransactions).toHaveBeenCalledWith({
        account: 'acc-gbp',
        from: '2026-05-01',
        to: '2026-05-31',
        type: 'transfer',
        count: 10,
      });
    });

    it('defaults count to 100 when omitted', async () => {
      await callTool(getTool(transactionsScope, 'get_transactions'), {}, ctx);
      expect(client.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({ count: 100 })
      );
    });

    it('rejects an invalid date format', async () => {
      await expect(
        callTool(getTool(transactionsScope, 'get_transactions'), { from: '05/01/2026' }, ctx)
      ).rejects.toThrow();
    });

    it('reports an empty result', async () => {
      client.getTransactions.mockResolvedValue([]);
      const result = await callTool(getTool(transactionsScope, 'get_transactions'), {}, ctx);
      expect(result).toBe('No transactions found for the given criteria.');
    });
  });

  describe('get_transaction', () => {
    it('returns full detail for a transaction', async () => {
      const result = await callTool(
        getTool(transactionsScope, 'get_transaction'),
        { transactionId: 'txn-1' },
        ctx
      );
      expect(client.getTransaction).toHaveBeenCalledWith('txn-1');
      expect(result).toContain('Transaction Detail');
      expect(result).toContain('txn-1');
      expect(result).toContain('Completed');
      expect(result).toContain('INV-1');
      expect(result).toContain('210 GBP');
    });

    it('handles transactions with no completed_at', async () => {
      client.getTransaction.mockResolvedValue(mockTransactions[1]);
      const result = await callTool(
        getTool(transactionsScope, 'get_transaction'),
        { transactionId: 'txn-2' },
        ctx
      );
      expect(result).toContain('Topup');
      expect(result).not.toContain('Completed  :');
    });
  });
});
