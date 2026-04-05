import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { AuthClient } from "./client/auth.js";
import { HttpClient } from "./client/http.js";
import { JwsSigner } from "./client/jws.js";
import { registerConsentTools } from "./tools/consents.js";
import { registerAccountTools } from "./tools/accounts.js";
import { registerTransactionTools } from "./tools/transactions.js";
import { registerDomesticPaymentTools } from "./tools/domestic-payments.js";
import { registerInternationalPaymentTools } from "./tools/international-payments.js";
import { registerScheduledPaymentTools } from "./tools/scheduled-payments.js";
import { registerStandingOrderTools } from "./tools/standing-orders.js";
import { registerFilePaymentTools } from "./tools/file-payments.js";

async function main(): Promise<void> {
  const config = loadConfig();

  const auth = new AuthClient(config);
  const jws = new JwsSigner(config);
  const http = new HttpClient(config, auth, jws);

  const server = new McpServer({
    name: "revolut-open-banking",
    version: "1.0.0",
  });

  // Register all tools
  registerConsentTools(server, http);
  registerAccountTools(server, http);
  registerTransactionTools(server, http);
  registerDomesticPaymentTools(server, http);
  registerInternationalPaymentTools(server, http);
  registerScheduledPaymentTools(server, http);
  registerStandingOrderTools(server, http);
  registerFilePaymentTools(server, http);

  // Start the server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
