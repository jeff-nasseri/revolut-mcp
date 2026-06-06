# Using the MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is an interactive developer tool for exercising an MCP server without wiring it into an AI assistant. It is the quickest way to confirm `revolut-mcp` starts correctly, see the tools it exposes, and call them by hand.

---

## Launch

The Inspector starts your server as a subprocess and connects to it over stdio. It reads configuration from the environment, so export the Revolut variables first, then point it at the server command.

### Against a built copy

From a source checkout that you have built (`npm run build`):

```bash
export REVOLUT_CLIENT_ID=your_client_id
export REVOLUT_PRIVATE_KEY_PATH=./certs/privatekey.pem
export REVOLUT_REDIRECT_URI=https://example.com/
export TOKEN_STORE_PATH=./.tokens.json
export REVOLUT_ENVIRONMENT=sandbox

npx @modelcontextprotocol/inspector node dist/index.js
```

### Against the published package

```bash
export REVOLUT_CLIENT_ID=your_client_id
export REVOLUT_PRIVATE_KEY_PATH=./certs/privatekey.pem
export REVOLUT_REDIRECT_URI=https://example.com/
export TOKEN_STORE_PATH=./.tokens.json
export REVOLUT_ENVIRONMENT=sandbox

npx @modelcontextprotocol/inspector npx @jeff-nasseri/revolut-mcp
```

The Inspector prints a local URL (it opens a small web UI). Open it in your browser.

> **Windows PowerShell:** set each variable with `$env:NAME = "value"` on its own line instead of `export`, then run the `npx @modelcontextprotocol/inspector ...` command.

> Everything after the Inspector package name is the **server command and its arguments** — here, `node dist/index.js`. The Inspector spawns that process and speaks MCP to it over stdio.

---

## What to expect

Once connected, the Inspector UI lets you:

- **Browse the tool list.** You should see the server's tools grouped by capability — authentication (`setup_auth`, `complete_auth`), accounts, transactions, counterparties, payments and transfers, foreign exchange, team, and the sandbox simulation helpers — each with its description and input schema.
- **Call tools interactively.** Select a tool, fill in its parameters from the generated form, and run it. The response text the server returns is shown in the result panel.
- **Inspect requests/responses** and server log output for debugging.

A good first run:

1. Call **`setup_auth`** (no parameters). Copy the authorization URL from the result, open it in a browser, and approve access.
2. Call **`complete_auth`** with the `code` query parameter from the redirect URL. This stores tokens at `TOKEN_STORE_PATH`.
3. Call **`get_accounts`** to confirm authenticated calls reach the Revolut sandbox.

For the full sign-in walkthrough see the [Authentication guide](../getting-started/authentication.md), and for realistic prompts see the [usage examples](../examples/usage-examples.md).
