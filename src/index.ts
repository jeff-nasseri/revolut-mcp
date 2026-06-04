#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getConfig } from './config.js';
import { createServer } from './server.js';

async function main(): Promise<void> {
  const config = getConfig();
  const server = createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // eslint-disable-next-line no-console
  console.error(`revolut-mcp connected (environment: ${config.environment}).`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error:', error);
  process.exit(1);
});
