import { paymentsScope } from '../src/scope/payments/index.js';
import { callTool, createMockClient, getTool, mockContext } from './mocks/revolut-client.mock.js';

describe('payments scope', () => {
  let client: ReturnType<typeof createMockClient>;
  let ctx: ReturnType<typeof mockContext>;

  beforeEach(() => {
    client = createMockClient();
    ctx = mockContext(client);
  });

  it('reports no payment drafts', async () => {
    const result = await callTool(getTool(paymentsScope, 'get_payment_drafts'), {}, ctx);
    expect(result).toContain('No payment drafts found.');
  });

  describe('get_transfer_reasons', () => {
    it('filters by country and currency', async () => {
      const result = await callTool(
        getTool(paymentsScope, 'get_transfer_reasons'),
        { country: 'gb', currency: 'gbp' },
        ctx
      );
      expect(result).toContain('general');
      expect(result).not.toContain('invoice');
    });

    it('returns all reasons when unfiltered', async () => {
      const result = await callTool(getTool(paymentsScope, 'get_transfer_reasons'), {}, ctx);
      expect(result).toContain('3 match');
    });
  });

  describe('create_payment', () => {
    it('builds the receiver and generates a request_id', async () => {
      const result = await callTool(
        getTool(paymentsScope, 'create_payment'),
        { account_id: 'acc-gbp', counterparty_id: 'cp-1', amount: 50, currency: 'gbp', reference: 'INV-9' },
        ctx
      );
      const payload = client.createPayment.mock.calls[0][0];
      expect(payload.account_id).toBe('acc-gbp');
      expect(payload.receiver).toEqual({ counterparty_id: 'cp-1' });
      expect(payload.currency).toBe('GBP');
      expect(payload.reference).toBe('INV-9');
      expect(typeof payload.request_id).toBe('string');
      expect(result).toContain('Payment submitted');
      expect(result).toContain('50 GBP');
    });

    it('includes counterparty account when provided', async () => {
      await callTool(
        getTool(paymentsScope, 'create_payment'),
        { account_id: 'acc-gbp', counterparty_id: 'cp-1', counterparty_account_id: 'cpa-1', amount: 10, currency: 'GBP' },
        ctx
      );
      const payload = client.createPayment.mock.calls[0][0];
      expect(payload.receiver).toEqual({ counterparty_id: 'cp-1', account_id: 'cpa-1' });
    });
  });

  it('transfers between own accounts', async () => {
    const result = await callTool(
      getTool(paymentsScope, 'transfer_between_accounts'),
      { source_account_id: 'acc-gbp', target_account_id: 'acc-eur', amount: 25, currency: 'gbp' },
      ctx
    );
    const payload = client.transfer.mock.calls[0][0];
    expect(payload.source_account_id).toBe('acc-gbp');
    expect(payload.target_account_id).toBe('acc-eur');
    expect(payload.currency).toBe('GBP');
    expect(result).toContain('Transfer submitted');
  });

  it('cancels a transaction', async () => {
    const result = await callTool(
      getTool(paymentsScope, 'cancel_transaction'),
      { transactionId: 'txn-9' },
      ctx
    );
    expect(client.cancelTransaction).toHaveBeenCalledWith('txn-9');
    expect(result).toContain('cancelled');
  });
});
