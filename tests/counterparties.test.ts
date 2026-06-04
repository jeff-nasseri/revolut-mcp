import { counterpartiesScope } from '../src/scope/counterparties/index.js';
import { callTool, createMockClient, getTool, mockContext } from './mocks/revolut-client.mock.js';

describe('counterparties scope', () => {
  let client: ReturnType<typeof createMockClient>;
  let ctx: ReturnType<typeof mockContext>;

  beforeEach(() => {
    client = createMockClient();
    ctx = mockContext(client);
  });

  it('lists counterparties with their accounts', async () => {
    const result = await callTool(getTool(counterpartiesScope, 'get_counterparties'), {}, ctx);
    expect(result).toContain('Acme Corp.');
    expect(result).toContain('IBAN DE89370400440532013000');
    expect(result).toContain('Rory Pearson');
    expect(result).toContain('zzznj6287');
  });

  it('gets a single counterparty', async () => {
    const result = await callTool(
      getTool(counterpartiesScope, 'get_counterparty'),
      { counterpartyId: 'cp-1' },
      ctx
    );
    expect(client.getCounterparty).toHaveBeenCalledWith('cp-1');
    expect(result).toContain('Acme Corp.');
  });

  it('creates a counterparty and upper-cases currency/country', async () => {
    const result = await callTool(
      getTool(counterpartiesScope, 'create_counterparty'),
      { company_name: 'Acme', bank_country: 'gb', currency: 'gbp', account_no: '12345678', sort_code: '040004' },
      ctx
    );
    expect(client.createCounterparty).toHaveBeenCalledWith(
      expect.objectContaining({ bank_country: 'GB', currency: 'GBP', company_name: 'Acme' })
    );
    expect(result).toContain('Counterparty created');
  });

  it('omits empty fields from the create payload', async () => {
    await callTool(
      getTool(counterpartiesScope, 'create_counterparty'),
      { revtag: 'zzz123', name: 'Friend', profile_type: 'personal' },
      ctx
    );
    const payload = client.createCounterparty.mock.calls[0][0];
    expect(payload).toHaveProperty('revtag', 'zzz123');
    expect(payload).not.toHaveProperty('iban');
  });

  it('deletes a counterparty', async () => {
    const result = await callTool(
      getTool(counterpartiesScope, 'delete_counterparty'),
      { counterpartyId: 'cp-2' },
      ctx
    );
    expect(client.deleteCounterparty).toHaveBeenCalledWith('cp-2');
    expect(result).toContain('deleted');
  });

  it('marks delete_counterparty as destructive', () => {
    const tool = getTool(counterpartiesScope, 'delete_counterparty');
    expect(tool.annotations?.destructiveHint).toBe(true);
  });
});
