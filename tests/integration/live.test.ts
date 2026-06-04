/**
 * Live integration test against the Revolut Business API sandbox.
 *
 * Skipped by default. To run it, authenticate once (so a token store exists) and
 * export the same variables the server uses, plus REVOLUT_RUN_INTEGRATION=1:
 *
 *   REVOLUT_RUN_INTEGRATION=1 \
 *   REVOLUT_CLIENT_ID=... \
 *   REVOLUT_PRIVATE_KEY_PATH=./certs/privatekey.pem \
 *   REVOLUT_JWT_ISS=example.com \
 *   REVOLUT_REDIRECT_URI=https://example.com/ \
 *   TOKEN_STORE_PATH=./.tokens.json \
 *   npm test -- live
 */
import { getConfig, resetConfig } from '../../src/config.js';
import { RevolutAuth } from '../../src/client/auth.js';
import { RevolutClient } from '../../src/client/revolut-client.js';

const ENABLED = process.env.REVOLUT_RUN_INTEGRATION === '1';
const describeLive = ENABLED ? describe : describe.skip;

describeLive('Revolut Business API (live sandbox)', () => {
  let client: RevolutClient;

  beforeAll(() => {
    resetConfig();
    const config = getConfig();
    const auth = new RevolutAuth(config);
    client = new RevolutClient(config, auth);
  });

  it('lists accounts', async () => {
    const accounts = await client.getAccounts();
    expect(Array.isArray(accounts)).toBe(true);
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts[0]).toHaveProperty('id');
    expect(accounts[0]).toHaveProperty('balance');
    expect(accounts[0]).toHaveProperty('currency');
  });

  it('returns an exchange rate with a fee', async () => {
    const rate = await client.getRate('GBP', 'USD', 100);
    expect(rate.from.currency).toBe('GBP');
    expect(rate.to.currency).toBe('USD');
    expect(typeof rate.rate).toBe('number');
    expect(rate.fee).toHaveProperty('amount');
  });
});
