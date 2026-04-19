import { getAccounts, getAccountBalance } from '../src/tools/account-tools.js';
import { createMockRevolutClient, mockBalancesResponse } from './mocks/revolut-client.mock.js';
import { RevolutClient } from '../src/client/revolut-client.js';

describe('account-tools', () => {
  let mockClient: ReturnType<typeof createMockRevolutClient>;

  beforeEach(() => {
    mockClient = createMockRevolutClient();
  });

  describe('getAccounts', () => {
    it('lists all accounts with balances', async () => {
      const result = await getAccounts(mockClient as unknown as RevolutClient);

      expect(mockClient.getAccounts).toHaveBeenCalledTimes(1);
      expect(mockClient.getAccountBalances).toHaveBeenCalledTimes(2);
      expect(result).toContain('acc-001');
      expect(result).toContain('acc-002');
      expect(result).toContain('GBP');
      expect(result).toContain('EUR');
      expect(result).toContain('1234.56');
    });

    it('returns no accounts message when list is empty', async () => {
      mockClient.getAccounts.mockResolvedValue({
        Data: { Account: [] },
        Links: { Self: '' },
        Meta: { TotalPages: 0 },
      });

      const result = await getAccounts(mockClient as unknown as RevolutClient);
      expect(result).toBe('No accounts found.');
    });

    it('includes account nickname in output', async () => {
      const result = await getAccounts(mockClient as unknown as RevolutClient);
      expect(result).toContain('Main GBP');
    });
  });

  describe('getAccountBalance', () => {
    it('returns balances for a specific account', async () => {
      const result = await getAccountBalance(mockClient as unknown as RevolutClient, {
        accountId: 'acc-001',
      });

      expect(mockClient.getAccountBalances).toHaveBeenCalledWith('acc-001');
      expect(result).toContain('acc-001');
      expect(result).toContain('InterimAvailable');
      expect(result).toContain('1234.56');
      expect(result).toContain('GBP');
    });

    it('returns not found message when no balances exist', async () => {
      mockClient.getAccountBalances.mockResolvedValue({
        Data: { Balance: [] },
        Links: { Self: '' },
        Meta: { TotalPages: 0 },
      });

      const result = await getAccountBalance(mockClient as unknown as RevolutClient, {
        accountId: 'acc-999',
      });
      expect(result).toContain('No balance data found for account acc-999');
    });

    it('shows debit indicator with minus prefix', async () => {
      mockClient.getAccountBalances.mockResolvedValue({
        ...mockBalancesResponse,
        Data: {
          Balance: [
            {
              ...mockBalancesResponse.Data.Balance[0],
              CreditDebitIndicator: 'Debit' as const,
            },
          ],
        },
      });

      const result = await getAccountBalance(mockClient as unknown as RevolutClient, {
        accountId: 'acc-001',
      });
      expect(result).toContain('-1234.56');
    });
  });
});
