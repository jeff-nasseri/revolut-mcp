<!-- mcp-name: io.github.jeff-nasseri/revolut-mcp -->

<p align="center">
  <img src="assets/revolut-mcp-banner.png" alt="Revolut MCP" width="100%" />
</p>

<h1 align="center">Revolut MCP</h1>

<p align="center">
  <a href="https://github.com/jeff-nasseri/revolut-mcp/actions/workflows/publish.yml"><img alt="Pipeline" src="https://img.shields.io/github/actions/workflow/status/jeff-nasseri/revolut-mcp/publish.yml?branch=master&label=pipeline&style=flat-square&color=%23007ACC" /></a>
  <a href="https://www.npmjs.com/package/@jeff-nasseri/revolut-mcp"><img alt="Deployment" src="https://img.shields.io/npm/v/@jeff-nasseri/revolut-mcp?label=deploy%20%40npm&style=flat-square&color=%2300C853" /></a>
  <a href="https://github.com/jeff-nasseri/revolut-mcp/actions/workflows/publish.yml"><img alt="Tests" src="https://img.shields.io/github/actions/workflow/status/jeff-nasseri/revolut-mcp/publish.yml?branch=master&label=tests&style=flat-square&color=%2300C853" /></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/github/license/jeff-nasseri/revolut-mcp?style=flat-square&color=%23FF6B35" /></a>
</p>

## Overview

Revolut MCP is a [Model Context Protocol](https://modelcontextprotocol.io) server that bridges AI
assistants (Claude, Cursor, etc.) and the **Revolut Business API**. Through natural-language requests
an assistant can list accounts and balances, browse transactions, manage counterparties, look up live
exchange rates, move money, and more — across 21 tools organized into eight scopes. It targets the
Revolut Business **sandbox** by default.

## Demo

> 📹 _Video walkthrough coming soon._
<!-- Add the recorded walkthrough link here, e.g. https://github.com/user-attachments/assets/XXXXXXXX -->

## Documentation

📚 **[Full Documentation](docs/README.md)** — installation, authentication, tool reference, and examples.

### Quick Links

- **[Installation](docs/getting-started/installation.md)** — npm, source, or Docker
- **[Generate a Sandbox Token](docs/getting-started/sandbox-token.md)** — set up the Revolut Business sandbox
- **[Authentication](docs/getting-started/authentication.md)** — certificate setup and the OAuth flow
- **[Testing](docs/getting-started/testing.md)** — unit and live integration tests
- **[Claude Desktop](docs/integrations/claude-desktop.md)** — editor integration
- **[Tool Reference](docs/README.md#tool-reference)** — every tool, by scope
- **[Contributing](CONTRIBUTING.md)** — add a tool or scope

## License

This MCP server is licensed under the [MIT License](LICENSE). You are free to use, modify, and
distribute it subject to the terms of that license.
