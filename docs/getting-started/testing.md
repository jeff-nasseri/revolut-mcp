# Testing

`revolut-mcp` uses [Jest](https://jestjs.io/) (via `ts-jest`) for testing. There are two layers:

- **Unit tests** — run by default, fully mocked, no network or credentials required.
- **Live integration test** — opt-in, hits the real Revolut Business **sandbox** API, and is skipped unless you explicitly enable it.

Run these from the repository root (a source checkout — see [Installation › From source](installation.md#b-from-source)).

---

## Unit tests

```bash
npm test
```

This runs the full unit-test suite (`tests/**/*.test.ts`). The Revolut API client is mocked, so no Client ID, private key, or token store is needed. This is the suite that runs in CI on every push and pull request.

### Coverage

```bash
npm run test:coverage
```

Same suite, with a coverage report. Results are written to the `coverage/` directory (open `coverage/lcov-report/index.html` in a browser for the HTML view).

---

## Live integration test

The live test in `tests/integration/live.test.ts` exercises the real sandbox API — for example, listing accounts and fetching an exchange rate with its fee. It is **skipped by default** and only runs when `REVOLUT_RUN_INTEGRATION=1` is set.

```bash
npm run test:integration
```

The `test:integration` script sets `REVOLUT_RUN_INTEGRATION=1` for you. Equivalently, you can run the live test file directly:

```bash
REVOLUT_RUN_INTEGRATION=1 npm test -- live
```

### Requirements

Because it calls the live sandbox, the live test needs the **same configuration the server uses**, and it reads tokens from your token store:

1. **A valid token store.** The integration test does not perform the browser sign-in itself — it relies on tokens already saved at `TOKEN_STORE_PATH`. Complete authentication first (run the server, call `setup_auth`, then `complete_auth`) so a `.tokens.json` exists. See the [Authentication guide](authentication.md).
2. **The configuration environment variables** set in the same shell, matching the certificate you authenticated with.

```bash
REVOLUT_RUN_INTEGRATION=1 \
REVOLUT_CLIENT_ID=your_client_id \
REVOLUT_PRIVATE_KEY_PATH=./certs/privatekey.pem \
REVOLUT_REDIRECT_URI=https://example.com/ \
REVOLUT_JWT_ISS=example.com \
TOKEN_STORE_PATH=./.tokens.json \
REVOLUT_ENVIRONMENT=sandbox \
npm run test:integration
```

> On Windows PowerShell, set the variables with `$env:NAME = "value"` on separate lines before running `npm run test:integration`, rather than the inline `NAME=value` prefix shown above (which is bash syntax).

> If `REVOLUT_RUN_INTEGRATION` is unset, the live suite is silently skipped — so a normal `npm test` never touches the network or requires credentials.
