# Authentication

The Revolut Business API uses OAuth 2.0 with a **`private_key_jwt` client assertion**. You upload a
public X.509 certificate to the Revolut Business portal and keep the matching private key locally;
that key signs a short-lived JWT used to obtain access tokens. There is **no mutual TLS** — API calls
are plain HTTPS with a Bearer token.

This is a one-time setup. After it, the server refreshes access tokens automatically (the refresh
token / consent window is long-lived, ~90 days).

---

## 1. Generate a key pair

```bash
mkdir -p certs
openssl genrsa -out certs/privatekey.pem 2048
openssl req -new -x509 -key certs/privatekey.pem -out certs/publickey.cer -days 1825 \
  -subj "/CN=revolut-mcp"
```

- `certs/privatekey.pem` — **private key** (keep secret; signs the JWT).
- `certs/publickey.cer` — **public certificate** (uploaded to Revolut).

> `certs/`, `*.pem`, and `*.key` are git-ignored. Never commit them.

## 2. Upload the certificate in the Revolut Business portal

In **Settings → APIs → Business API → Add certificate**:

- **X509 public key:** paste the full contents of `certs/publickey.cer` (including the
  `-----BEGIN/END CERTIFICATE-----` lines).
- **OAuth redirect URI:** use a **public HTTPS URL** such as `https://example.com/`.
  > ⚠️ `localhost` URLs are **rejected** by Revolut's consent page ("Bad Request — Please check that
  > the redirect URL provided is correct"). You only ever copy the `code` from the redirect, so a
  > neutral public URL like `https://example.com/` is fine.

After saving, the portal shows your **Client ID** and confirms the **JWT `iss`** (the host of the
redirect URI, e.g. `example.com`).

## 3. Configure the server

Copy `.env.sandbox.template` to `.env` and fill in:

```env
REVOLUT_CLIENT_ID=your_client_id
REVOLUT_PRIVATE_KEY_PATH=./certs/privatekey.pem
REVOLUT_REDIRECT_URI=https://example.com/
# REVOLUT_JWT_ISS defaults to the redirect URI host (example.com)
TOKEN_STORE_PATH=./.tokens.json
REVOLUT_ENVIRONMENT=sandbox
```

The `iss` claim **must** equal the redirect URI host. The server derives it automatically from
`REVOLUT_REDIRECT_URI`, or you can set `REVOLUT_JWT_ISS` explicitly.

## 4. Authorize (the `setup_auth` → `complete_auth` flow)

### Step 1 — `setup_auth`

Ask the assistant to call **`setup_auth`**. It returns a URL of the form:

```
https://sandbox-business.revolut.com/app-confirm?client_id=...&redirect_uri=https%3A%2F%2Fexample.com%2F&response_type=code
```

Open it in your browser.

### Step 2 — approve in the browser

Approve the requested access. Revolut may insert an **identity re-verification** step
(`sso-confirm-reauth`) that ends with *"Successfully authorized — please return to your original
tab."* In that case the actual redirect completes in the **original tab** where you opened the URL —
switch back to it.

The browser then lands on your redirect URI with a `code`:

```
https://example.com/?code=oa_sand_xxxxxxxx
```

Copy the **`code`** value.

> The authorization code is **single-use** and expires within a couple of minutes — complete the
> next step promptly.

### Step 3 — `complete_auth`

Call **`complete_auth`** with `code="oa_sand_xxxxxxxx"`. The server exchanges it for access +
refresh tokens and stores them at `TOKEN_STORE_PATH`. You're ready to use all the tools.

---

## Token lifetime & refresh

- **Access token:** ~40 minutes. Refreshed automatically using the stored refresh token.
- **Refresh token / consent:** long-lived (~90 days). When it eventually expires, repeat
  `setup_auth` → `complete_auth` once.

## Scopes

When you authorize, Revolut asks which capabilities to grant (read, manage, payments, sensitive card
details). The read-only tools only need **"Read your account details."** Grant the minimum your
workflow needs — only enable payments/management if you intend to use the write tools.

## Production

Set `REVOLUT_ENVIRONMENT=production` to target `b2b.revolut.com`. Production requires a certificate
registered on the production Business portal and adherence to Revolut's API terms (and, where
applicable, IP whitelisting).
