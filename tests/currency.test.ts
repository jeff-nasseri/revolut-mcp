import nock from 'nock';
import { getExchangeRate, convertCurrency } from '../src/tools/currency-tools.js';

const FRANKFURTER = 'https://api.frankfurter.app';

describe('currency-tools', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('getExchangeRate', () => {
    it('returns latest rates for a base currency', async () => {
      nock(FRANKFURTER)
        .get('/latest')
        .query({ base: 'GBP' })
        .reply(200, {
          amount: 1,
          base: 'GBP',
          date: '2024-01-15',
          rates: { EUR: 1.1681, USD: 1.2745, JPY: 190.42 },
        });

      const result = await getExchangeRate({ baseCurrency: 'GBP' });

      expect(result).toContain('Latest rates');
      expect(result).toContain('GBP');
      expect(result).toContain('EUR: 1.168100');
      expect(result).toContain('USD: 1.274500');
      expect(result).toContain('JPY: 190.420000');
    });

    it('filters to specific target currencies', async () => {
      nock(FRANKFURTER)
        .get('/latest')
        .query({ base: 'USD', symbols: 'EUR,GBP' })
        .reply(200, {
          amount: 1,
          base: 'USD',
          date: '2024-01-15',
          rates: { EUR: 0.9234, GBP: 0.7845 },
        });

      const result = await getExchangeRate({
        baseCurrency: 'USD',
        targetCurrencies: ['EUR', 'GBP'],
      });

      expect(result).toContain('EUR: 0.923400');
      expect(result).toContain('GBP: 0.784500');
    });

    it('returns historical rates when date is provided', async () => {
      nock(FRANKFURTER)
        .get('/2023-06-01')
        .query({ base: 'EUR' })
        .reply(200, {
          amount: 1,
          base: 'EUR',
          date: '2023-06-01',
          rates: { GBP: 0.8622, USD: 1.0726 },
        });

      const result = await getExchangeRate({ baseCurrency: 'EUR', date: '2023-06-01' });

      expect(result).toContain('Historical rates on 2023-06-01');
      expect(result).toContain('EUR');
    });

    it('includes ECB attribution', async () => {
      nock(FRANKFURTER)
        .get('/latest')
        .query({ base: 'EUR' })
        .reply(200, { amount: 1, base: 'EUR', date: '2024-01-15', rates: { USD: 1.08 } });

      const result = await getExchangeRate({ baseCurrency: 'EUR' });
      expect(result).toContain('European Central Bank');
    });
  });

  describe('convertCurrency', () => {
    it('converts amount between currencies', async () => {
      nock(FRANKFURTER)
        .get('/latest')
        .query({ base: 'GBP', symbols: 'EUR', amount: '100' })
        .reply(200, {
          amount: 100,
          base: 'GBP',
          date: '2024-01-15',
          rates: { EUR: 116.81 },
        });

      const result = await convertCurrency({
        amount: 100,
        fromCurrency: 'GBP',
        toCurrency: 'EUR',
      });

      expect(result).toContain('100 GBP');
      expect(result).toContain('116.8100 EUR');
      expect(result).toContain('1 GBP =');
    });

    it('handles historical conversion', async () => {
      nock(FRANKFURTER)
        .get('/2023-01-01')
        .query({ base: 'USD', symbols: 'JPY', amount: '50' })
        .reply(200, {
          amount: 50,
          base: 'USD',
          date: '2023-01-01',
          rates: { JPY: 6650.5 },
        });

      const result = await convertCurrency({
        amount: 50,
        fromCurrency: 'USD',
        toCurrency: 'JPY',
        date: '2023-01-01',
      });

      expect(result).toContain('on 2023-01-01');
      expect(result).toContain('6650.5000 JPY');
    });

    it('returns not available message for unknown currency', async () => {
      nock(FRANKFURTER)
        .get('/latest')
        .query({ base: 'GBP', symbols: 'XYZ', amount: '10' })
        .reply(200, { amount: 10, base: 'GBP', date: '2024-01-15', rates: {} });

      const result = await convertCurrency({
        amount: 10,
        fromCurrency: 'GBP',
        toCurrency: 'XYZ',
      });

      expect(result).toContain('not available');
    });
  });
});
