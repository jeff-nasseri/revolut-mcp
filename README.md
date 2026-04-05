# Revolut Open Banking MCP Server

A Model Context Protocol (MCP) server for the [Revolut Open Banking API](https://developer.revolut.com/docs/open-banking/open-banking-api), enabling AI assistants like Claude to securely interact with Revolut banking services via the UK Open Banking Standard (v3.1.1).

## Features

- **Account Information (AISP)**: Accounts, balances, transactions, beneficiaries, direct debits, standing orders
- **Payment Initiation (PISP)**: Domestic, international, scheduled, standing orders, and batch file payments
- **Consent Management**: Create, retrieve, and revoke account access consents
- **Secure Authentication**: OAuth 2.0 with mTLS certificates and JWS signatures
- **PSD2 Compliant**: Follows Open Banking UK standards

## Prerequisites

- Node.js 18+
- Revolut Open Banking API credentials (TPP registration)
- Transport certificate and signing key (OBIE or eIDAS)
- MCP-compatible client (e.g., Claude Desktop, Claude Code)

## Installation

```bash
git clone https://github.com/heartran/revolut-mcp.git
cd revolut-mcp
npm install
npm run build
```

## Configuration

1. Register as a TPP with Revolut and obtain your credentials
2. Copy `.env.example` to `.env` and fill in your details:

```env
REVOLUT_ENVIRONMENT=sandbox
REVOLUT_CLIENT_ID=your_client_id
REVOLUT_SIGNING_KEY=./certs/signing.key
REVOLUT_SIGNING_KEY_ID=your_key_id
REVOLUT_TRANSPORT_CERT=./certs/transport.pem
REVOLUT_TRANSPORT_KEY=./certs/transport.key
REVOLUT_REDIRECT_URI=https://example.com/callback
```

3. Configure your MCP client:

```json
{
  "mcpServers": {
    "revolut": {
      "command": "node",
      "args": ["/path/to/revolut-mcp/dist/index.js"],
      "env": {
        "REVOLUT_ENVIRONMENT": "sandbox",
        "REVOLUT_CLIENT_ID": "your_client_id",
        "REVOLUT_SIGNING_KEY": "./certs/signing.key",
        "REVOLUT_SIGNING_KEY_ID": "your_key_id",
        "REVOLUT_TRANSPORT_CERT": "./certs/transport.pem",
        "REVOLUT_TRANSPORT_KEY": "./certs/transport.key",
        "REVOLUT_REDIRECT_URI": "https://example.com/callback"
      }
    }
  }
}
```

## Available Tools

### Consent Management
| Tool | Description |
|------|-------------|
| `create_account_consent` | Create an account access consent with specified permissions |
| `get_account_consent` | Retrieve consent status |
| `delete_account_consent` | Revoke/delete a consent |

### Account Information (AISP)
| Tool | Description |
|------|-------------|
| `get_accounts` | List all accounts |
| `get_account` | Get a specific account |
| `get_account_balances` | Get account balance |
| `get_account_beneficiaries` | Get account beneficiaries |
| `get_account_transactions` | Get transactions with date filtering |
| `get_account_direct_debits` | Get direct debits |
| `get_account_standing_orders` | Get standing orders |

### Domestic Payments (PISP)
| Tool | Description |
|------|-------------|
| `create_domestic_payment_consent` | Create a domestic payment consent |
| `get_domestic_payment_consent` | Get consent status |
| `get_domestic_payment_funds_confirmation` | Check funds availability |
| `create_domestic_payment` | Execute a domestic payment |
| `get_domestic_payment` | Get payment status |

### International Payments
| Tool | Description |
|------|-------------|
| `create_international_payment_consent` | Create an international payment consent |
| `get_international_payment_consent` | Get consent status |
| `get_international_payment_funds_confirmation` | Check funds availability |
| `create_international_payment` | Execute an international payment |
| `get_international_payment` | Get payment status |

### Scheduled Payments
| Tool | Description |
|------|-------------|
| `create_domestic_scheduled_payment_consent` | Schedule a domestic payment |
| `create_international_scheduled_payment_consent` | Schedule an international payment |
| `get_*_scheduled_payment_consent` | Get consent status |
| `create_*_scheduled_payment` | Execute scheduled payment |
| `get_*_scheduled_payment` | Get payment status |

### Standing Orders
| Tool | Description |
|------|-------------|
| `create_domestic_standing_order_consent` | Set up a domestic standing order |
| `create_international_standing_order_consent` | Set up an international standing order |
| `get_*_standing_order_consent` | Get consent status |
| `create_*_standing_order` | Execute standing order |
| `get_*_standing_order` | Get order status |

### File/Batch Payments
| Tool | Description |
|------|-------------|
| `create_file_payment_consent` | Create a batch payment consent |
| `upload_payment_file` | Upload a CSV payment file |
| `create_file_payment` | Execute batch payment |
| `get_file_payment` | Get batch payment status |
| `get_file_payment_report` | Get payment report |

## Security

- Transport certificates provide mTLS authentication
- OAuth 2.0 client credentials with JWT client assertions
- JWS detached signatures on all payment requests
- Tokens are cached and auto-refreshed before expiry
- PSD2 SCA compliance: 5-minute access window for sensitive data

## API Reference

- [Revolut Open Banking API Documentation](https://developer.revolut.com/docs/open-banking/open-banking-api)
- [Open Banking UK Standard v3.1.1](https://openbankinguk.github.io/read-write-api-site3/v3.1.1/)
- [Model Context Protocol](https://modelcontextprotocol.io)

## License

MIT

## Disclaimer

This is an unofficial integration and is not affiliated with, endorsed by, or supported by Revolut Ltd. Use at your own risk. Always review the code and ensure compliance with Revolut's terms of service and API usage policies.
