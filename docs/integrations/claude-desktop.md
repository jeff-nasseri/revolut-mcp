# Using revolut-mcp with Claude Desktop

[Claude Desktop](https://claude.ai/download) can launch `revolut-mcp` as a local MCP server over stdio. You register the server in Claude Desktop's config file, providing the command to start it and the Revolut configuration as environment variables.

---

## Config file location

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

If the file does not exist yet, create it. You can also open it from Claude Desktop via **Settings → Developer → Edit Config**.

---

## Option A — run a built copy with `node`

Use this if you installed [from source](../getting-started/installation.md#b-from-source) and ran `npm run build`. Point `args` at the absolute path of the compiled `dist/index.js`.

```json
{
  "mcpServers": {
    "revolut": {
      "command": "node",
      "args": ["/absolute/path/to/revolut-mcp/dist/index.js"],
      "env": {
        "REVOLUT_CLIENT_ID": "your_client_id",
        "REVOLUT_PRIVATE_KEY_PATH": "/absolute/path/to/certs/privatekey.pem",
        "REVOLUT_REDIRECT_URI": "https://example.com/",
        "TOKEN_STORE_PATH": "/absolute/path/to/.tokens.json",
        "REVOLUT_ENVIRONMENT": "sandbox"
      }
    }
  }
}
```

## Option B — run from npm with `npx`

Use this to run the published package without a local build. Claude Desktop will fetch and start `@jeff-nasseri/revolut-mcp` on demand.

```json
{
  "mcpServers": {
    "revolut": {
      "command": "npx",
      "args": ["-y", "@jeff-nasseri/revolut-mcp"],
      "env": {
        "REVOLUT_CLIENT_ID": "your_client_id",
        "REVOLUT_PRIVATE_KEY_PATH": "/absolute/path/to/certs/privatekey.pem",
        "REVOLUT_REDIRECT_URI": "https://example.com/",
        "TOKEN_STORE_PATH": "/absolute/path/to/.tokens.json",
        "REVOLUT_ENVIRONMENT": "sandbox"
      }
    }
  }
}
```

---

## Notes

- **Use absolute paths.** Claude Desktop does not run from your project directory, so relative paths for `args`, `REVOLUT_PRIVATE_KEY_PATH`, and `TOKEN_STORE_PATH` will not resolve reliably. On Windows, escape backslashes in JSON (e.g. `"C:\\Users\\you\\revolut-mcp\\dist\\index.js"`).
- **Private key.** `REVOLUT_PRIVATE_KEY_PATH` points at your PEM key file. Alternatively, supply the key contents inline with `REVOLUT_PRIVATE_KEY` instead (one of the two is required).
- **Token store.** Set `TOKEN_STORE_PATH` to a writable absolute path so your authentication persists between Claude Desktop restarts.
- See the full list of configuration variables in [Installation › Configuration](../getting-started/installation.md#configuration).

---

## Apply and authenticate

1. Save the config file.
2. **Fully quit and restart Claude Desktop** (a window reload is not enough) so it picks up the change. The `revolut` server's tools then appear in the tool list (the slider/hammer icon).
3. The server starts unauthenticated. In a conversation, ask Claude to **call `setup_auth`**, open the returned URL, approve access, then ask Claude to **call `complete_auth`** with the `code` from the redirect URL. See the [Authentication guide](../getting-started/authentication.md) and the [usage examples](../examples/usage-examples.md).

If the tools do not appear, re-open **Settings → Developer** to check the server's status and logs for startup errors (most often a malformed JSON config or a missing Client ID / private key).
