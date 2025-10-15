# Revolut MCP Server

> ⚠️ **This project is currently under development and not ready for production use.**

A Model Context Protocol (MCP) server implementation for Revolut Bank, enabling AI assistants like Claude to securely interact with Revolut's banking services.

## Overview

This MCP server provides a standardized interface for AI applications to access Revolut banking functionality through the Model Context Protocol. It allows secure, programmatic access to account information, transaction history, and other banking operations.

## Features (Planned)

- 🏦 Account balance and details retrieval
- 💸 Transaction history and search
- 👤 Profile and beneficiary management
- 🔒 Secure authentication with Revolut API
- 📊 Multi-currency account support
- 🔔 Real-time notifications (webhooks)

## Prerequisites

- Node.js 18+ or Python 3.10+
- Revolut Business API credentials
- MCP-compatible client (e.g., Claude Desktop)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/revolut-mcp-server.git
cd revolut-mcp-server

# Install dependencies
npm install
# or
pip install -r requirements.txt
```

## Configuration

1. Obtain your Revolut API credentials from the [Revolut Business Portal](https://business.revolut.com/)
2. Create a `.env` file in the project root:

```env
REVOLUT_API_KEY=your_api_key_here
REVOLUT_CLIENT_ID=your_client_id_here
REVOLUT_ENVIRONMENT=sandbox  # or 'production'
```

3. Configure your MCP client to connect to this server

## Usage

### Starting the Server

```bash
npm start
# or
python server.py
```

### MCP Client Configuration

Add to your MCP settings file (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "revolut": {
      "command": "node",
      "args": ["/path/to/revolut-mcp-server/index.js"],
      "env": {
        "REVOLUT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### `get_accounts`
Retrieve all Revolut accounts and their balances

### `get_transactions`
Fetch transaction history with filtering options
- Parameters: account_id, from_date, to_date, limit

### `get_counterparties`
List saved beneficiaries and counterparties

### `get_exchange_rate`
Get current exchange rates between currencies

## API Reference

This server implements the following MCP protocol methods:

- `tools/list` - Lists all available banking tools
- `tools/call` - Executes banking operations
- `resources/list` - Lists accessible account resources
- `resources/read` - Reads account and transaction data

## Security Considerations

- ✅ All API credentials should be stored in environment variables
- ✅ Never commit sensitive data to version control
- ✅ Use Revolut's sandbox environment for testing
- ✅ Implement proper error handling for failed requests
- ✅ Follow OAuth 2.0 best practices for authentication

## Development Status

**Current Stage:** Initial Development

### Roadmap

- [ ] Core MCP server setup
- [ ] Revolut API authentication
- [ ] Basic account information retrieval
- [ ] Transaction history access
- [ ] Payment initiation (future)
- [ ] Comprehensive error handling
- [ ] Unit and integration tests
- [ ] Documentation completion

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Revolut Business API Docs](https://developer.revolut.com/docs/business/business-api)
- [MCP Specification](https://spec.modelcontextprotocol.io)

## License

[MIT License](LICENSE)

## Disclaimer

This is an unofficial integration and is not affiliated with, endorsed by, or supported by Revolut Ltd. Use at your own risk. Always review the code and ensure compliance with Revolut's terms of service and API usage policies.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [MCP community forums](https://github.com/modelcontextprotocol/mcp/discussions)
