# revolut-mcp

> **Sandbox only.** This MCP server connects to Revolut's Open Banking **sandbox** environment. Using it with a real Revolut account requires additional compliance registration — see [Production Use](#production-use).

A [Model Context Protocol](https://modelcontextprotocol.io) server that lets AI assistants (Claude, Cursor, etc.) interact with Revolut Personal accounts. Query balances, browse transaction history, inspect individual transactions, and look up live currency exchange rates — all from a conversation.

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Sandbox Setup](#sandbox-setup)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Running the Server](#running-the-server)
8. [Authentication Flow](#authentication-flow)
9. [Tools Reference](#tools-reference)
10. [Connecting to Claude Desktop](#connecting-to-claude-desktop)
11. [Development](#development)
12. [Production Use](#production-use)
13. [License](#license)

---

## Features

| Tool | Description |
|---|---|
| `setup_auth` | Step 1: Create consent & get the authorization URL |
| `complete_auth` | Step 2: Exchange authorization code for tokens |
| `get_accounts` | List all accounts with real-time balances |
| `get_account_balance` | All balance types for a specific account |
| `get_transactions` | Transaction history with optional date filtering |
| `get_transaction_detail` | Full detail of a single transaction |
| `get_exchange_rate` | Live / historical ECB exchange rates |
| `convert_currency` | Convert an amount between any two currencies |

---

## Architecture

```
revolut-mcp/
├── src/
│   ├── index.ts                 # MCP server, tool registry
│   ├── config.ts                # Env-based configuration
│   ├── client/
│   │   ├── auth.ts              # OAuth2 + mTLS authentication
│   │   ├── revolut-client.ts    # Revolut Open Banking API client
│   │   └── token-store.ts       # Persists tokens to disk
│   ├── tools/
│   │   ├── auth-tools.ts        # setup_auth, complete_auth
│   │   ├── account-tools.ts     # get_accounts, get_account_balance
│   │   ├── transaction-tools.ts # get_transactions, get_transaction_detail
│   │   └── currency-tools.ts    # get_exchange_rate, convert_currency
│   └── types/
│       └── revolut.ts           # Open Banking API response types
├── tests/                       # Jest unit tests
├── .github/workflows/
│   ├── test.yml                 # Runs on every push / PR
│   └── publish.yml              # Publishes to npm on version tags
├── .env.sandbox.template
├── GitVersion.yml               # Semantic versioning config
└── ...
```

**Authentication:** Revolut Open Banking uses mutual TLS (mTLS) plus OAuth 2.0 with a JWT Authorization Request (JAR). The server handles token refresh automatically. Tokens are persisted to a local `.tokens.json` file between restarts.

**Currency rates:** The `get_exchange_rate` and `convert_currency` tools use the [Frankfurter API](https://www.frankfurter.app/) (European Central Bank data, no API key required) so they work independently of Revolut authentication.

---

## Prerequisites

- **Node.js 18+**
- A **Revolut Developer** sandbox account — [developer.revolut.com](https://developer.revolut.com)
- A generated mTLS transport certificate (see [Sandbox Setup](#sandbox-setup))

---

## Sandbox Setup

### 1. Create a sandbox account

Register at the [Revolut Developer Portal](https://developer.revolut.com). You can skip email verification and use mock details for the sandbox.

### 2. Generate your transport certificate

In the Developer Portal, go to **Sandbox → Authentication** and generate a Certificate Signing Request (CSR). This downloads a `transport.pem` and `private.key`.

Alternatively, generate your own and upload the public certificate:

```bash
mkdir -p certs
openssl req -newkey rsa:2048 -nodes \
  -keyout certs/private.key \
  -x509 -days 365 \
  -out certs/transport.pem \
  -subj "/CN=revolut-mcp-sandbox"
```

> Upload `transport.pem` to the Developer Portal under **Sandbox → Authentication**.

### 3. Note your Client ID

Find your **Client ID** on the Developer Portal **Overview** tab.

### 4. Set your Redirect URI

In the Developer Portal, add a redirect URI. For local testing `https://localhost:3000/callback` works — you only need to copy the `code` from the URL manually, no local server required.

---

## Installation

### From npm (once published)

```bash
npm install -g @jeffnasseri/revolut-mcp
```

### From source

```bash
git clone https://github.com/jeffnasseri/revolut-mcp.git
cd revolut-mcp
npm install
npm run build
```

---

## Configuration

Copy the template and fill in your values:

```bash
cp .env.sandbox.template .env
```

```env
# .env
REVOLUT_CLIENT_ID=your_client_id_here
REVOLUT_CERT_PATH=./certs/transport.pem
REVOLUT_KEY_PATH=./certs/private.key
REVOLUT_REDIRECT_URI=https://localhost:3000/callback
TOKEN_STORE_PATH=./.tokens.json
REVOLUT_ENVIRONMENT=sandbox
```

| Variable | Required | Description |
|---|---|---|
| `REVOLUT_CLIENT_ID` | Yes | Client ID from the Developer Portal |
| `REVOLUT_CERT_PATH` | Yes | Path to `transport.pem` |
| `REVOLUT_KEY_PATH` | Yes | Path to `private.key` |
| `REVOLUT_SIGNING_KEY_PATH` | No | Separate signing key (defaults to transport key) |
| `REVOLUT_REDIRECT_URI` | Yes | Must match what's set in the portal |
| `TOKEN_STORE_PATH` | No | Where to persist tokens (default: `./.tokens.json`) |
| `REVOLUT_ENVIRONMENT` | No | Always `sandbox` for this server |

---

## Running the Server

```bash
# Built version
node dist/index.js

# Development (ts-node)
npm run dev

# Via npx (after npm publish)
npx @jeffnasseri/revolut-mcp
```

---

## Authentication Flow

The server uses the Open Banking OAuth 2.0 authorization code flow. You only need to do this once — the server refreshes tokens automatically.

### Step 1 — Ask Claude to set up auth

```
Call the setup_auth tool
```

Claude will return an authorization URL. Open it in your browser.

### Step 2 — Authorize in the browser

Revolut's sandbox UI will show an account selection / consent screen. Accept it. You'll be redirected to your redirect URI:

```
https://localhost:3000/callback?code=abc123xyz&...
```

Copy the `code` value from the URL.

### Step 3 — Complete auth

```
Call complete_auth with code="abc123xyz"
```

Tokens are saved to `.tokens.json`. You're ready to use all account tools.

> **Token lifetime:** Revolut sandbox access tokens expire after 1 hour. The server automatically refreshes them using the stored refresh token.

---

## Tools Reference

### `setup_auth`

Creates an account access consent and returns the Revolut authorization URL.

**Input:** _(none)_

**Output:** The authorization URL to visit in your browser.

---

### `complete_auth`

Exchanges the authorization code for access + refresh tokens.

| Parameter | Type | Description |
|---|---|---|
| `code` | string | The `code` query param from the redirect URL |

---

### `get_accounts`

Lists all accounts with their current balances.

**Input:** _(none)_

**Example output:**
```
Account ID : acc-001
Currency   : GBP
Type       : CurrentAccount
Nickname   : Main GBP
Balances:
  InterimAvailable: 1234.56 GBP (as of 2024-01-15T10:00:00Z)
  InterimBooked: 1300.00 GBP (as of 2024-01-15T10:00:00Z)
```

---

### `get_account_balance`

All balance types for a specific account.

| Parameter | Type | Description |
|---|---|---|
| `accountId` | string | Revolut account ID |

---

### `get_transactions`

Transaction history with optional date filtering.

| Parameter | Type | Description |
|---|---|---|
| `accountId` | string | Revolut account ID |
| `fromDate` | string? | Start date `YYYY-MM-DD` |
| `toDate` | string? | End date `YYYY-MM-DD` |
| `limit` | number? | Max results (1–500, default 50) |

> **PSD2 Note:** Full transaction history is only available in the first 5 minutes after authorization. After that, the regulatory window is limited to the last 90 days.

---

### `get_transaction_detail`

Full detail of a single transaction including FX info, merchant, and running balance.

| Parameter | Type | Description |
|---|---|---|
| `accountId` | string | Revolut account ID |
| `transactionId` | string | Transaction ID |

---

### `get_exchange_rate`

Live or historical exchange rates from the European Central Bank.

| Parameter | Type | Description |
|---|---|---|
| `baseCurrency` | string | ISO 4217 code, e.g. `GBP` |
| `targetCurrencies` | string[]? | Specific targets, e.g. `["EUR","USD"]`. Omit for all. |
| `date` | string? | Historical date `YYYY-MM-DD`. Omit for latest. |

> Does **not** require Revolut authentication.

---

### `convert_currency`

Convert an amount between two currencies.

| Parameter | Type | Description |
|---|---|---|
| `amount` | number | Amount to convert |
| `fromCurrency` | string | Source currency code |
| `toCurrency` | string | Target currency code |
| `date` | string? | Historical date `YYYY-MM-DD`. Omit for latest. |

---

## Connecting to Claude Desktop

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "revolut": {
      "command": "node",
      "args": ["/absolute/path/to/revolut-mcp/dist/index.js"],
      "env": {
        "REVOLUT_CLIENT_ID": "your_client_id",
        "REVOLUT_CERT_PATH": "/absolute/path/to/certs/transport.pem",
        "REVOLUT_KEY_PATH": "/absolute/path/to/certs/private.key",
        "REVOLUT_REDIRECT_URI": "https://localhost:3000/callback",
        "TOKEN_STORE_PATH": "/absolute/path/to/.tokens.json"
      }
    }
  }
}
```

Restart Claude Desktop after saving. The revolut tools will appear in the tool list.

---

## Development

```bash
npm install          # install deps
npm run dev          # run with ts-node (no build step)
npm run build        # compile TypeScript
npm test             # run unit tests
npm run test:watch   # watch mode
npm run test:coverage
npm run lint         # type-check only
```

### Versioning

This project uses [GitVersion](https://gitversion.net/) with the config in `GitVersion.yml`. Semantic versions are determined from conventional commit messages:

| Commit prefix | Version bump |
|---|---|
| `feat:` | minor |
| `fix:`, `refactor:`, `perf:` | patch |
| `feat!:` or `fix!:` | major |
| `chore:`, `docs:`, `ci:` | no bump |

Publishing to npm is triggered by pushing a `v*` tag.

---

## Production Use

Integrating with a **live Revolut Personal account** requires:

1. Registering your application with Revolut for production Open Banking access
2. Obtaining an **eIDAS** or **OBIE** qualified transport certificate from a regulated Certificate Authority
3. Completing Open Banking compliance registration in your jurisdiction
4. Complying with PSD2 / SCA requirements

This is a non-trivial regulatory process. This MCP server intentionally targets the sandbox only and has no production configuration.

---

## Disclaimer

This is an **unofficial, community project** and is not affiliated with, endorsed by, or supported by Revolut Ltd. Use at your own risk. Always review the code before connecting it to any financial account, even in sandbox.

## License

[MIT](LICENSE)
