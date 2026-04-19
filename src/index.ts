#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getConfig } from './config.js';
import { RevolutAuth } from './client/auth.js';
import { RevolutClient } from './client/revolut-client.js';
import {
  setupAuth,
  completeAuth,
  setupAuthInputSchema,
  completeAuthInputSchema,
} from './tools/auth-tools.js';
import {
  getAccounts,
  getAccountBalance,
  getAccountsInputSchema,
  getAccountBalanceInputSchema,
} from './tools/account-tools.js';
import {
  getTransactions,
  getTransactionDetail,
  getTransactionsInputSchema,
  getTransactionDetailInputSchema,
} from './tools/transaction-tools.js';
import {
  getExchangeRate,
  convertCurrency,
  getExchangeRateInputSchema,
  convertCurrencyInputSchema,
} from './tools/currency-tools.js';

function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodFieldToJsonSchema(value as z.ZodTypeAny);
      if (!(value instanceof z.ZodOptional) && !(value instanceof z.ZodDefault)) {
        required.push(key);
      }
    }

    return { type: 'object', properties, required };
  }
  return { type: 'object', properties: {} };
}

function zodFieldToJsonSchema(field: z.ZodTypeAny): Record<string, unknown> {
  let schema: z.ZodTypeAny = field;
  let description: string | undefined;

  if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault) {
    schema = schema._def.innerType as z.ZodTypeAny;
  }

  if (schema._def?.description) description = schema._def.description as string;

  const base: Record<string, unknown> = {};
  if (description) base.description = description;

  if (schema instanceof z.ZodString) return { ...base, type: 'string' };
  if (schema instanceof z.ZodNumber) return { ...base, type: 'number' };
  if (schema instanceof z.ZodBoolean) return { ...base, type: 'boolean' };
  if (schema instanceof z.ZodArray) {
    return { ...base, type: 'array', items: zodFieldToJsonSchema(schema.element) };
  }

  return { ...base, type: 'string' };
}

async function main() {
  const config = getConfig();
  const auth = new RevolutAuth(config);
  const client = new RevolutClient(config, auth);

  const server = new Server(
    { name: 'revolut-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'setup_auth',
        description:
          'Step 1 of authentication. Creates a Revolut account access consent and returns the URL the user must visit to authorize access.',
        inputSchema: zodToJsonSchema(setupAuthInputSchema),
      },
      {
        name: 'complete_auth',
        description:
          'Step 2 of authentication. Exchanges the authorization code (from the redirect URL) for access tokens. Must be run after setup_auth.',
        inputSchema: zodToJsonSchema(completeAuthInputSchema),
      },
      {
        name: 'get_accounts',
        description:
          'Lists all Revolut accounts with their current balances. Requires authentication.',
        inputSchema: zodToJsonSchema(getAccountsInputSchema),
      },
      {
        name: 'get_account_balance',
        description:
          'Gets all balance types (booked, available, etc.) for a specific Revolut account.',
        inputSchema: zodToJsonSchema(getAccountBalanceInputSchema),
      },
      {
        name: 'get_transactions',
        description:
          'Retrieves transaction history for a Revolut account with optional date range filtering.',
        inputSchema: zodToJsonSchema(getTransactionsInputSchema),
      },
      {
        name: 'get_transaction_detail',
        description:
          'Gets full details of a single transaction including currency exchange info, merchant, and running balance.',
        inputSchema: zodToJsonSchema(getTransactionDetailInputSchema),
      },
      {
        name: 'get_exchange_rate',
        description:
          'Gets current or historical exchange rates for a base currency. Data sourced from the European Central Bank via Frankfurter API.',
        inputSchema: zodToJsonSchema(getExchangeRateInputSchema),
      },
      {
        name: 'convert_currency',
        description:
          'Converts an amount from one currency to another using ECB rates. Supports historical date lookup.',
        inputSchema: zodToJsonSchema(convertCurrencyInputSchema),
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let text: string;

      switch (name) {
        case 'setup_auth':
          text = await setupAuth(auth);
          break;
        case 'complete_auth':
          text = await completeAuth(auth, completeAuthInputSchema.parse(args));
          break;
        case 'get_accounts':
          text = await getAccounts(client);
          break;
        case 'get_account_balance':
          text = await getAccountBalance(client, getAccountBalanceInputSchema.parse(args));
          break;
        case 'get_transactions':
          text = await getTransactions(client, getTransactionsInputSchema.parse(args));
          break;
        case 'get_transaction_detail':
          text = await getTransactionDetail(client, getTransactionDetailInputSchema.parse(args));
          break;
        case 'get_exchange_rate':
          text = await getExchangeRate(getExchangeRateInputSchema.parse(args));
          break;
        case 'convert_currency':
          text = await convertCurrency(convertCurrencyInputSchema.parse(args));
          break;
        default:
          return {
            content: [{ type: 'text', text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }

      return { content: [{ type: 'text', text }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
