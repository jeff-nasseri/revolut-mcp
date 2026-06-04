import { teamScope } from '../src/scope/team/index.js';
import { callTool, createMockClient, getTool, mockContext } from './mocks/revolut-client.mock.js';

describe('team scope', () => {
  let client: ReturnType<typeof createMockClient>;
  let ctx: ReturnType<typeof mockContext>;

  beforeEach(() => {
    client = createMockClient();
    ctx = mockContext(client);
  });

  it('lists team members with name, email and role', async () => {
    const result = await callTool(getTool(teamScope, 'get_team_members'), {}, ctx);
    expect(result).toContain('Jane Doe');
    expect(result).toContain('owner@example.com');
    expect(result).toContain('owner');
  });

  it('reports an empty team', async () => {
    client.getTeamMembers.mockResolvedValue([]);
    const result = await callTool(getTool(teamScope, 'get_team_members'), {}, ctx);
    expect(result).toBe('No team members found.');
  });
});
