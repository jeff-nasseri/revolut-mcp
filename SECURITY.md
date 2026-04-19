# Security Policy

## Scope

This project is a **sandbox-only** MCP server. It connects exclusively to Revolut's sandbox environment (`sandbox-oba.revolut.com`). No production Revolut credentials or real financial data are ever handled by this codebase.

## Sensitive Files — Never Commit

| File / Pattern | Why |
|---|---|
| `.env` | Contains client ID and paths to key material |
| `*.pem`, `*.key`, `*.p12` | mTLS transport certificates and private keys |
| `.tokens.json` | Live OAuth access + refresh tokens |
| `certs/` directory | All certificate material |

These are listed in `.gitignore`. Verify with `git status` before pushing.

## Credential Hygiene

- **Rotate** your sandbox certificates immediately if they are accidentally committed
- **Never share** your `private.key` or `transport.pem` in issues, PRs, or Slack
- Store certificate files outside the repository directory where possible, then point to them via `REVOLUT_CERT_PATH` / `REVOLUT_KEY_PATH`
- The token store (`.tokens.json`) holds live OAuth tokens — treat it like a password file

## Reporting a Vulnerability

If you discover a security vulnerability in this project, **please do not open a public GitHub issue**.

Instead, contact the maintainer directly:

- **Email:** sir.jeff.nasseri@gmail.com
- **Subject:** `[revolut-mcp] Security Vulnerability`

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations

You can expect an acknowledgement within **48 hours** and a resolution plan within **7 days** for critical issues.

## Production Use Warning

This MCP server is designed and tested exclusively against the **Revolut sandbox**. Connecting it to a live Revolut account requires:

1. Registering your application in the Revolut Developer Portal for production access
2. Obtaining a valid eIDAS or OBIE transport certificate from a regulated CA
3. Completing Open Banking compliance registration
4. Complying with PSD2 Strong Customer Authentication (SCA) requirements

**Do not attempt to use sandbox credentials against the production Revolut API.**
