import { z } from 'zod';
import { defineTool, Scope } from '../../utils/tool.js';
import { TeamMember } from '../../types/revolut.js';
import { joinParts } from '../../utils/format.js';

function formatMember(m: TeamMember): string {
  const name = joinParts([m.first_name, m.last_name], ' ') || '(no name)';
  const lines = [`• ${name}  [${m.id}]`];
  if (m.email) lines.push(`    Email : ${m.email}`);
  if (m.role_id) lines.push(`    Role  : ${m.role_id}`);
  if (m.state) lines.push(`    State : ${m.state}`);
  return lines.join('\n');
}

const emptySchema = z.object({});

export const teamScope: Scope = {
  name: 'team',
  description: 'Business team members and their roles.',
  tools: [
    defineTool({
      name: 'get_team_members',
      description:
        'Lists the team members of the Revolut Business account with their email, role, and state.',
      schema: emptySchema,
      annotations: { title: 'Get team members', readOnlyHint: true, openWorldHint: true },
      handler: async (_input, { client }) => {
        const members = await client.getTeamMembers();
        if (!members.length) return 'No team members found.';
        return `${members.length} team member(s):\n\n` + members.map(formatMember).join('\n\n');
      },
    }),
  ],
};
