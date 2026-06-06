# Generating a Sandbox Token

To use revolut-mcp against the Revolut Business **sandbox** you need three things:

1. a sandbox Business account,
2. an API certificate (a key pair, with the public cert uploaded to the portal), and
3. an **access token** obtained through the OAuth flow.

This page walks the sandbox-specific setup. For the underlying auth mechanism (how the JWT and token
exchange work) see the **[Authentication guide](authentication.md)**.

> **Official Revolut references**
> - [Prepare your Sandbox environment](https://developer.revolut.com/docs/guides/manage-accounts/get-started/prepare-sandbox-environment)
> - [Make your first API request](https://developer.revolut.com/docs/guides/manage-accounts/get-started/make-your-first-api-request)
> - [Business API overview](https://developer.revolut.com/docs/business/business-api)

---

## 1. Create a sandbox Business account

Sign up at **[sandbox-business.revolut.com](https://sandbox-business.revolut.com)**. The sandbox accepts
mock details and seeds your profile with test accounts, balances, counterparties, and transactions —
no real data or money is involved. See Revolut's
[Prepare your Sandbox environment](https://developer.revolut.com/docs/guides/manage-accounts/get-started/prepare-sandbox-environment)
guide for the full walkthrough.

## 2. Generate and upload your API certificate

Create a key pair:

```bash
mkdir -p certs
openssl genrsa -out certs/privatekey.pem 2048
openssl req -new -x509 -key certs/privatekey.pem -out certs/publickey.cer -days 1825 \
  -subj "/CN=revolut-mcp"
```

In **Settings → APIs → Business API → Add certificate**:

- Paste the contents of `certs/publickey.cer` into the **X509 public key** field.
- Set the **OAuth redirect URI** to a public HTTPS URL such as `https://example.com/`.
  > ⚠️ `localhost` redirect URIs are rejected by Revolut's consent page. You only copy the `code` from
  > the redirect, so a neutral public URL is fine.

Save, then copy the **Client ID** the portal shows. The portal also confirms the JWT **`iss`** (the
host of your redirect URI, e.g. `example.com`).

## 3. Configure revolut-mcp

```env
REVOLUT_CLIENT_ID=your_client_id
REVOLUT_PRIVATE_KEY_PATH=./certs/privatekey.pem
REVOLUT_REDIRECT_URI=https://example.com/
TOKEN_STORE_PATH=./.tokens.json
REVOLUT_ENVIRONMENT=sandbox
```

## 4. Obtain the token (`setup_auth` → `complete_auth`)

1. Ask your assistant to call **`setup_auth`** — it returns an authorization URL. Open it.
2. Approve access. Revolut may insert an identity re-verification step that ends with *"return to your
   original tab"* — switch back to the tab where you opened the URL.
3. The browser lands on `https://example.com/?code=oa_sand_…`. Copy the **`code`**.
4. Call **`complete_auth`** with that `code`. Tokens are stored at `TOKEN_STORE_PATH` and refreshed
   automatically (the consent window is ~90 days).

Full details, including token lifetime and the cross-tab re-auth behaviour, are in the
**[Authentication guide](authentication.md)**.

## 5. Generate test data (optional)

The sandbox seeds some accounts and transactions. To create more, use the **sandbox** scope tools —
`simulate_topup` (add test funds) and `simulate_transaction_state` (drive a transfer through states).
See the **[Sandbox reference](../reference/sandbox/README.md)**.

---

## References

- Revolut — [Prepare your Sandbox environment](https://developer.revolut.com/docs/guides/manage-accounts/get-started/prepare-sandbox-environment)
- Revolut — [Make your first API request](https://developer.revolut.com/docs/guides/manage-accounts/get-started/make-your-first-api-request)
- Revolut — [Business API overview](https://developer.revolut.com/docs/business/business-api)
- This repo — [Authentication guide](authentication.md)
