import { accountsScope } from '../src/scope/accounts/index.js';
import { callTool, createMockClient, getTool, mockContext } from './mocks/revolut-client.mock.js';

describe('accounts scope', () => {
  let client: ReturnType<typeof createMockClient>;
  let ctx: ReturnType<typeof mockContext>;

  beforeEach(() => {
    client = createMockClient();
    ctx = mockContext(client);
  });

  describe('get_accounts', () => {
    it('lists accounts with formatted balances', async () => {
      const result = await callTool(getTool(accountsScope, 'get_accounts'), {}, ctx);
      expect(client.getAccounts).toHaveBeenCalledTimes(1);
      expect(result).toContain('2 account(s)');
      expect(result).toContain('Main');
      expect(result).toContain('28,900 GBP');
      expect(result).toContain('European suppliers');
      expect(result).toContain('3,280 EUR');
    });

    it('handles an empty account list', async () => {
      client.getAccounts.mockResolvedValue([]);
      const result = await callTool(getTool(accountsScope, 'get_accounts'), {}, ctx);
      expect(result).toBe('No accounts found.');
    });
  });

  describe('get_account', () => {
    it('returns a single account', async () => {
      const result = await callTool(getTool(accountsScope, 'get_account'), { accountId: 'acc-gbp' }, ctx);
      expect(client.getAccount).toHaveBeenCalledWith('acc-gbp');
      expect(result).toContain('Main');
      expect(result).toContain('28,900 GBP');
    });

    it('rejects a missing accountId', async () => {
      await expect(
        callTool(getTool(accountsScope, 'get_account'), {}, ctx)
      ).rejects.toThrow();
    });
  });

  describe('get_account_bank_details', () => {
    it('renders both local and IBAN scheme sets', async () => {
      const result = await callTool(
        getTool(accountsScope, 'get_account_bank_details'),
        { accountId: 'acc-gbp' },
        ctx
      );
      expect(client.getAccountBankDetails).toHaveBeenCalledWith('acc-gbp');
      expect(result).toContain('06543359');
      expect(result).toContain('042909');
      expect(result).toContain('GB20REVO04290906543359');
      expect(result).toContain('REVOGB21');
      expect(result).toContain('faster_payments');
      expect(result).toContain('2–24 hours');
    });

    it('reports when there are no bank details', async () => {
      client.getAccountBankDetails.mockResolvedValue([]);
      const result = await callTool(
        getTool(accountsScope, 'get_account_bank_details'),
        { accountId: 'acc-x' },
        ctx
      );
      expect(result).toContain('No bank details found');
    });
  });
});
