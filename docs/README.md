# Revolut MCP Documentation

Complete documentation for **revolut-mcp** — a Model Context Protocol server for the
**Revolut Business API** (accounts, transactions, counterparties, payments, FX, and team).

## Getting Started

- **[Installation](getting-started/installation.md)** — install from npm, source, or Docker
- **[Generate a Sandbox Token](getting-started/sandbox-token.md)** — set up the Revolut Business sandbox and obtain a token
- **[Authentication](getting-started/authentication.md)** — generate your certificate and complete the OAuth flow
- **[Testing](getting-started/testing.md)** — run the unit and live integration tests

## Integrations

- **[Claude Desktop](integrations/claude-desktop.md)** — configure revolut-mcp for Claude Desktop
- **[MCP Inspector](integrations/inspector.md)** — interactive testing tool

## Tool Reference

Tools are organized by scope. Each scope has its own reference page:

- **[Auth](reference/auth/README.md)** — authorize the app and exchange the code for tokens
- **[Accounts](reference/accounts/README.md)** — list accounts, balances, and bank details
- **[Transactions](reference/transactions/README.md)** — transaction history and detail
- **[Counterparties](reference/counterparties/README.md)** — manage payees
- **[Payments](reference/payments/README.md)** — payments, transfers, drafts, and cancellation
- **[Foreign Exchange](reference/foreign-exchange/README.md)** — live rates and currency exchange
- **[Team](reference/team/README.md)** — team members and roles
- **[Sandbox](reference/sandbox/README.md)** — sandbox-only test-data simulation

## Examples

- **[Usage Examples](examples/usage-examples.md)** — example prompts grouped by capability

## Contributing

- **[Contributing Guide](../CONTRIBUTING.md)** — how to contribute, including adding a new tool/scope

## Disclaimer

This is an unofficial, community project and is not affiliated with, endorsed by, or supported
by Revolut Ltd. Review the code before connecting it to any account, and prefer the sandbox.
