import fs from 'fs';
import path from 'path';
import os from 'os';
import { TokenStore } from '../src/client/token-store.js';
import { StoredTokens } from '../src/types/revolut.js';

function tempFile(): string {
  return path.join(os.tmpdir(), `revolut-test-tokens-${Date.now()}.json`);
}

describe('TokenStore', () => {
  let filePath: string;
  let store: TokenStore;

  const validTokens: StoredTokens = {
    accessToken: 'access-abc',
    refreshToken: 'refresh-xyz',
    expiresAt: Date.now() + 3600_000,
    scope: 'accounts',
  };

  beforeEach(() => {
    filePath = tempFile();
    store = new TokenStore(filePath);
  });

  afterEach(() => {
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }
  });

  it('returns null when no token file exists', () => {
    expect(store.load()).toBeNull();
  });

  it('saves and loads tokens correctly', () => {
    store.save(validTokens);
    const loaded = store.load();
    expect(loaded).toEqual(validTokens);
  });

  it('clears tokens by deleting the file', () => {
    store.save(validTokens);
    store.clear();
    expect(store.load()).toBeNull();
  });

  it('clear does not throw when file is already absent', () => {
    expect(() => store.clear()).not.toThrow();
  });

  it('isExpired returns false for a token that has not expired', () => {
    expect(store.isExpired(validTokens)).toBe(false);
  });

  it('isExpired returns true for an expired token', () => {
    const expired: StoredTokens = { ...validTokens, expiresAt: Date.now() - 1000 };
    expect(store.isExpired(expired)).toBe(true);
  });

  it('isExpired returns true when within the buffer window', () => {
    const almostExpired: StoredTokens = { ...validTokens, expiresAt: Date.now() + 30_000 };
    expect(store.isExpired(almostExpired, 60)).toBe(true);
  });
});
