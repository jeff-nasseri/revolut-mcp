import { sandboxScope } from '../src/scope/sandbox/index.js';
import { callTool, createMockClient, getTool, mockContext } from './mocks/revolut-client.mock.js';

describe('sandbox scope', () => {
  let client: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    client = createMockClient();
  });

  describe('simulate_topup', () => {
    it('tops up an account in sandbox', async () => {
      const ctx = mockContext(client, { environment: 'sandbox' });
      const result = await callTool(
        getTool(sandboxScope, 'simulate_topup'),
        { account_id: 'acc-gbp', amount: 500, currency: 'gbp' },
        ctx
      );
      const payload = client.sandboxTopup.mock.calls[0][0];
      expect(payload.account_id).toBe('acc-gbp');
      expect(payload.currency).toBe('GBP');
      expect(typeof payload.request_id).toBe('string');
      expect(result).toContain('Sandbox top-up submitted');
      expect(result).toContain('500 GBP');
    });

    it('refuses to run outside the sandbox environment', async () => {
      const ctx = mockContext(client, { environment: 'production' });
      const result = await callTool(
        getTool(sandboxScope, 'simulate_topup'),
        { account_id: 'acc-gbp', amount: 500, currency: 'GBP' },
        ctx
      );
      expect(result).toContain('only available in the sandbox');
      expect(client.sandboxTopup).not.toHaveBeenCalled();
    });
  });

  describe('simulate_transaction_state', () => {
    it('drives a transaction to a target state', async () => {
      const ctx = mockContext(client, { environment: 'sandbox' });
      const result = await callTool(
        getTool(sandboxScope, 'simulate_transaction_state'),
        { transactionId: 'txn-1', action: 'complete' },
        ctx
      );
      expect(client.sandboxSetTransactionState).toHaveBeenCalledWith('txn-1', 'complete');
      expect(result).toContain('complete');
    });

    it('rejects an invalid action', async () => {
      const ctx = mockContext(client, { environment: 'sandbox' });
      await expect(
        callTool(
          getTool(sandboxScope, 'simulate_transaction_state'),
          { transactionId: 'txn-1', action: 'explode' },
          ctx
        )
      ).rejects.toThrow();
    });
  });
});
