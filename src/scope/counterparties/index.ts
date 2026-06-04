import { z } from 'zod';
import { defineTool, Scope } from '../../utils/tool.js';
import { Counterparty, CounterpartyAccount } from '../../types/revolut.js';
import { joinParts } from '../../utils/format.js';

function formatCpAccount(a: CounterpartyAccount): string {
  const id = joinParts(
    [a.iban && `IBAN ${a.iban}`, a.account_no && `Acct ${a.account_no}`, a.sort_code && `Sort ${a.sort_code}`],
    ', '
  );
  const head = joinParts([a.name ?? a.type ?? 'account', a.currency], ' ');
  return `    - ${head}${id ? ` (${id})` : ''}  [${a.id}]`;
}

function formatCounterparty(c: Counterparty): string {
  const lines = [`• ${c.name}  [${c.id}]`, `    Type  : ${c.profile_type ?? 'n/a'}`, `    State : ${c.state}`];
  if (c.revtag) lines.push(`    Revtag : ${c.revtag}`);
  if (c.country) lines.push(`    Country: ${c.country}`);
  if (c.accounts?.length) {
    lines.push('    Accounts:');
    for (const a of c.accounts) lines.push(formatCpAccount(a));
  }
  return lines.join('\n');
}

const emptySchema = z.object({});
const cpIdSchema = z.object({
  counterpartyId: z.string().min(1).describe('The counterparty ID (UUID)'),
});

const createSchema = z.object({
  name: z.string().optional().describe('Display name (used for Revtag counterparties or as a fallback label)'),
  profile_type: z
    .enum(['personal', 'business'])
    .optional()
    .describe('Profile type for a Revolut (Revtag) counterparty'),
  revtag: z.string().optional().describe('Revtag of a Revolut user — creates a Revolut counterparty'),
  company_name: z.string().optional().describe('Company name for an external business counterparty'),
  individual_first_name: z.string().optional().describe('First name for an external individual counterparty'),
  individual_last_name: z.string().optional().describe('Last name for an external individual counterparty'),
  bank_country: z.string().length(2).optional().describe('Bank country (ISO 3166-1 alpha-2), e.g. GB'),
  currency: z.string().length(3).optional().describe('Account currency (ISO 4217), e.g. GBP'),
  account_no: z.string().optional().describe('Local account number'),
  sort_code: z.string().optional().describe('UK sort code'),
  routing_number: z.string().optional().describe('US routing number'),
  iban: z.string().optional().describe('IBAN for SEPA/SWIFT counterparties'),
  bic: z.string().optional().describe('BIC/SWIFT code'),
  email: z.string().optional().describe('Counterparty email address'),
});

export const counterpartiesScope: Scope = {
  name: 'counterparties',
  description: 'Saved payees (counterparties): list, inspect, create, and delete.',
  tools: [
    defineTool({
      name: 'get_counterparties',
      description: 'Lists all saved counterparties (payees) with their accounts and identifiers.',
      schema: emptySchema,
      annotations: { title: 'Get counterparties', readOnlyHint: true, openWorldHint: true },
      handler: async (_input, { client }) => {
        const cps = await client.getCounterparties();
        if (!cps.length) return 'No counterparties found.';
        return `${cps.length} counterparty(ies):\n\n` + cps.map(formatCounterparty).join('\n\n');
      },
    }),
    defineTool({
      name: 'get_counterparty',
      description: 'Gets a single counterparty by ID, including its linked accounts.',
      schema: cpIdSchema,
      annotations: { title: 'Get counterparty', readOnlyHint: true, openWorldHint: true },
      handler: async (input, { client }) => {
        const cp = await client.getCounterparty(input.counterpartyId);
        return formatCounterparty(cp);
      },
    }),
    defineTool({
      name: 'create_counterparty',
      description:
        'Creates a new counterparty (payee). Provide a `revtag` for a Revolut counterparty, or external bank details (IBAN/BIC or account number + sort code, plus bank_country and currency). This is a write operation.',
      schema: createSchema,
      annotations: { title: 'Create counterparty', readOnlyHint: false, openWorldHint: true },
      handler: async (input, { client }) => {
        const payload: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(input)) {
          if (value === undefined || value === '') continue;
          if (key === 'currency' || key === 'bank_country') {
            payload[key] = String(value).toUpperCase();
          } else {
            payload[key] = value;
          }
        }
        const cp = await client.createCounterparty(payload);
        return 'Counterparty created:\n\n' + formatCounterparty(cp);
      },
    }),
    defineTool({
      name: 'delete_counterparty',
      description: 'Deletes a counterparty (payee) by ID. This is a destructive, irreversible operation.',
      schema: cpIdSchema,
      annotations: {
        title: 'Delete counterparty',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
      handler: async (input, { client }) => {
        await client.deleteCounterparty(input.counterpartyId);
        return `Counterparty ${input.counterpartyId} deleted.`;
      },
    }),
  ],
};
