# Security Policy

## Scope

Revolut MCP connects to the **Revolut Business API**. It defaults to the **sandbox**
(`sandbox-b2b.revolut.com`) and only targets production (`b2b.revolut.com`) when
`REVOLUT_ENVIRONMENT=production` is set with a production certificate.

The server authenticates with OAuth 2.0 using a `private_key_jwt` client assertion. Your **private
key** signs a short-lived JWT; the matching **public certificate** is uploaded to the Revolut portal.
There is no mutual TLS — API calls use a Bearer access token.

## Sensitive Files — Never Commit

| File / Pattern | Why |
|---|---|
| `.env` | Contains the client ID and paths/secrets |
| `*.pem`, `*.key`, `*.p12`, `*.pfx` | The private key that signs the auth JWT |
| `certs/` | All certificate material |
| `.tokens.json` | Live OAuth access + refresh tokens |

These are listed in `.gitignore`. Verify with `git status` before pushing.

## Credential Hygiene

- The **private key** is the most sensitive secret — anyone with it can mint tokens for your account.
  Store it outside the repo where possible and point `REVOLUT_PRIVATE_KEY_PATH` at it, or pass it via
  `REVOLUT_PRIVATE_KEY` from a secrets manager.
- **Rotate** the certificate (generate a new key pair and re-upload the public cert) immediately if
  the private key is ever exposed.
- The **token store** (`.tokens.json`) holds live tokens — treat it like a password file.
- **Grant the minimum OAuth scopes** your workflow needs. The read-only tools only require
  "Read your account details"; only enable payments/management if you use the write tools.
- **Never share** your private key, `.env`, or token store in issues, PRs, or chat.

## Containers

Environment variables are visible via `docker inspect`, so a private key or client ID passed that way
is readable by anyone with host access. In shared or production environments, manage these through
your infrastructure (Docker secrets, a vault) and restrict host access. Prefer mounting the key file
and using `REVOLUT_PRIVATE_KEY_PATH` over inlining it.

## Money-Moving Tools

`create_payment`, `transfer_between_accounts`, and `exchange_currency` move funds; `delete_counterparty`
and `cancel_transaction` are destructive. They are annotated with `destructiveHint`/non-`readOnly`
hints so MCP clients can require explicit confirmation. Review any such call before approving it.

## Reporting a Vulnerability

Please **do not open a public GitHub issue** for security vulnerabilities. Instead, contact the
maintainer directly:

- **Email:** sir.jeff.nasseri@gmail.com
- **Subject:** `[revolut-mcp] Security Vulnerability`

Include a description, reproduction steps, potential impact, and any suggested mitigations. You can
expect an acknowledgement within **48 hours** and a resolution plan within **7 days** for critical
issues.

## Production Use

Targeting the production Business API requires a certificate registered on the production Revolut
Business portal and adherence to Revolut's API terms (including any IP-whitelisting requirements).
Do not use sandbox credentials against production, or vice versa.
