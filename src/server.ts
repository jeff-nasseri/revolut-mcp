import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Config } from './config.js';
import { RevolutAuth } from './client/auth.js';
import { RevolutClient } from './client/revolut-client.js';
import { ToolContext, ToolDefinition } from './utils/tool.js';
import { zodToJsonSchema } from './utils/json-schema.js';
import { formatError } from './utils/errors.js';
import { scopes } from './scope/index.js';
import { SERVER_NAME, SERVER_VERSION } from './version.js';

/** Build the MCP server, wiring every scope's tools to the Revolut client. */
export function createServer(config: Config): Server {
  const auth = new RevolutAuth(config);
  const client = new RevolutClient(config, auth);
  const ctx: ToolContext = { config, auth, client };

  const tools: ToolDefinition<any>[] = scopes.flatMap((scope) => scope.tools);
  const toolMap = new Map(tools.map((tool) => [tool.name, tool]));

  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.schema) as { type: 'object' },
      ...(tool.annotations ? { annotations: tool.annotations } : {}),
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = toolMap.get(name);

    if (!tool) {
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }

    try {
      const parsed = tool.schema.parse(args ?? {});
      const text = await tool.handler(parsed, ctx);
      return { content: [{ type: 'text', text }] };
    } catch (error) {
      return { content: [{ type: 'text', text: `Error: ${formatError(error)}` }], isError: true };
    }
  });

  return server;
}
