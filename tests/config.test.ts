import { getConfig, resetConfig } from '../src/config.js';

const RELEVANT = [
  'REVOLUT_CLIENT_ID',
  'REVOLUT_PRIVATE_KEY',
  'REVOLUT_PRIVATE_KEY_PATH',
  'REVOLUT_JWT_ISS',
  'REVOLUT_JWT_AUD',
  'REVOLUT_REDIRECT_URI',
  'TOKEN_STORE_PATH',
  'REVOLUT_ENVIRONMENT',
];

const ORIGINAL: Record<string, string | undefined> = {};

describe('config', () => {
  beforeAll(() => {
    for (const k of RELEVANT) ORIGINAL[k] = process.env[k];
  });

  beforeEach(() => {
    resetConfig();
    for (const k of RELEVANT) delete process.env[k];
  });

  afterAll(() => {
    for (const k of RELEVANT) {
      if (ORIGINAL[k] === undefined) delete process.env[k];
      else process.env[k] = ORIGINAL[k];
    }
    resetConfig();
  });

  it('throws when the client id is missing', () => {
    process.env.REVOLUT_PRIVATE_KEY = 'KEY';
    process.env.REVOLUT_REDIRECT_URI = 'https://example.com/';
    expect(() => getConfig()).toThrow(/clientId/i);
  });

  it('throws when no private key is provided', () => {
    process.env.REVOLUT_CLIENT_ID = 'cid';
    process.env.REVOLUT_REDIRECT_URI = 'https://example.com/';
    expect(() => getConfig()).toThrow(/PRIVATE_KEY/);
  });

  it('derives the JWT issuer from the redirect URI host and defaults to sandbox', () => {
    process.env.REVOLUT_CLIENT_ID = 'cid';
    process.env.REVOLUT_PRIVATE_KEY = 'KEY';
    process.env.REVOLUT_REDIRECT_URI = 'https://example.com/callback';
    const cfg = getConfig();
    expect(cfg.jwtIssuer).toBe('example.com');
    expect(cfg.apiBaseUrl).toContain('sandbox-b2b');
    expect(cfg.jwtAudience).toBe('https://revolut.com');
  });

  it('uses production endpoints when environment=production', () => {
    process.env.REVOLUT_CLIENT_ID = 'cid';
    process.env.REVOLUT_PRIVATE_KEY = 'KEY';
    process.env.REVOLUT_REDIRECT_URI = 'https://example.com/';
    process.env.REVOLUT_ENVIRONMENT = 'production';
    const cfg = getConfig();
    expect(cfg.apiBaseUrl).toBe('https://b2b.revolut.com/api/1.0');
    expect(cfg.authBaseUrl).toBe('https://business.revolut.com');
  });

  it('honours an explicit REVOLUT_JWT_ISS', () => {
    process.env.REVOLUT_CLIENT_ID = 'cid';
    process.env.REVOLUT_PRIVATE_KEY = 'KEY';
    process.env.REVOLUT_REDIRECT_URI = 'https://example.com/';
    process.env.REVOLUT_JWT_ISS = 'my-issuer.dev';
    expect(getConfig().jwtIssuer).toBe('my-issuer.dev');
  });
});
