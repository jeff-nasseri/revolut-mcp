import { foreignExchangeScope } from '../src/scope/foreign-exchange/index.js';
import { callTool, createMockClient, getTool, mockContext } from './mocks/revolut-client.mock.js';

describe('foreign-exchange scope', () => {
  let client: ReturnType<typeof createMockClient>;
  let ctx: ReturnType<typeof mockContext>;

  beforeEach(() => {
    client = createMockClient();
    ctx = mockContext(client);
  });

  describe('get_exchange_rate', () => {
    it('formats the rate, converted amount and fee', async () => {
      const result = await callTool(
        getTool(foreignExchangeScope, 'get_exchange_rate'),
        { from: 'gbp', to: 'usd', amount: 100 },
        ctx
      );
      expect(client.getRate).toHaveBeenCalledWith('GBP', 'USD', 100);
      expect(result).toContain('100 GBP');
      expect(result).toContain('134.59 USD');
      expect(result).toContain('1 GBP = 1.345997 USD');
      expect(result).toContain('Fee : 0.54 USD');
    });

    it('works without an amount', async () => {
      await callTool(getTool(foreignExchangeScope, 'get_exchange_rate'), { from: 'GBP', to: 'USD' }, ctx);
      expect(client.getRate).toHaveBeenCalledWith('GBP', 'USD', undefined);
    });
  });

  describe('exchange_currency', () => {
    it('puts the amount on the "from" side by default', async () => {
      const result = await callTool(
        getTool(foreignExchangeScope, 'exchange_currency'),
        {
          from_account_id: 'acc-gbp',
          to_account_id: 'acc-usd',
          from_currency: 'gbp',
          to_currency: 'usd',
          amount: 100,
        },
        ctx
      );
      const payload = client.exchange.mock.calls[0][0] as any;
      expect(payload.from).toEqual({ account_id: 'acc-gbp', currency: 'GBP', amount: 100 });
      expect(payload.to).toEqual({ account_id: 'acc-usd', currency: 'USD' });
      expect(result).toContain('Exchange submitted');
    });

    it('puts the amount on the "to" side when requested', async () => {
      await callTool(
        getTool(foreignExchangeScope, 'exchange_currency'),
        {
          from_account_id: 'acc-gbp',
          to_account_id: 'acc-usd',
          from_currency: 'GBP',
          to_currency: 'USD',
          amount: 100,
          amount_side: 'to',
        },
        ctx
      );
      const payload = client.exchange.mock.calls[0][0] as any;
      expect(payload.from).toEqual({ account_id: 'acc-gbp', currency: 'GBP' });
      expect(payload.to).toEqual({ account_id: 'acc-usd', currency: 'USD', amount: 100 });
    });
  });
});
