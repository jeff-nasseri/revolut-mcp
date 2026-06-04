import { allTools, scopes } from '../src/scope/index.js';
import { createServer } from '../src/server.js';
import { zodToJsonSchema } from '../src/utils/json-schema.js';
import { Config } from '../src/config.js';

const fakeConfig = {
  clientId: 'cid',
  privateKey: 'KEY',
  privateKeyPath: undefined,
  jwtIssuer: 'example.com',
  jwtAudience: 'https://revolut.com',
  redirectUri: 'https://example.com/',
  tokenStorePath: '/tmp/revolut-test.json',
  environment: 'sandbox',
  apiBaseUrl: 'https://sandbox-b2b.revolut.com/api/1.0',
  authBaseUrl: 'https://sandbox-business.revolut.com',
} as unknown as Config;

describe('tool registry', () => {
  const tools = allTools();

  it('exposes all expected scopes', () => {
    expect(scopes.map((s) => s.name).sort()).toEqual(
      [
        'accounts',
        'auth',
        'counterparties',
        'foreign-exchange',
        'payments',
        'sandbox',
        'team',
        'transactions',
      ].sort()
    );
  });

  it('registers at least 21 tools with unique names', () => {
    expect(tools.length).toBeGreaterThanOrEqual(21);
    const names = tools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every tool has snake_case name, a description, and an object input schema', () => {
    for (const tool of tools) {
      expect(tool.name).toMatch(/^[a-z][a-z_]+$/);
      expect(tool.description.length).toBeGreaterThan(10);
      const json = zodToJsonSchema(tool.schema) as { type?: string };
      expect(json.type).toBe('object');
    }
  });

  it('flags destructive tools with the destructiveHint annotation', () => {
    const destructive = tools.filter((t) => t.annotations?.destructiveHint).map((t) => t.name);
    expect(destructive).toContain('delete_counterparty');
    expect(destructive).toContain('cancel_transaction');
  });

  it('builds an MCP server without throwing', () => {
    expect(() => createServer(fakeConfig)).not.toThrow();
  });
});
