# Usage Examples

These are example **natural-language prompts** you can give an AI assistant (Claude Desktop, Cursor, etc.) that has `revolut-mcp` connected. The assistant maps your request to the right tool and fills in the parameters — you generally do not need to name tools or pass IDs by hand, though you can be explicit when it helps.

Examples are grouped by capability. Unless noted, everything runs against the Revolut Business **sandbox**.

> **Authentication required first.** Apart from `setup_auth`/`complete_auth` and exchange-rate lookups, every example needs a completed sign-in. Do the [Authentication](#authentication) steps once per token store.

> ⚠️ **Some actions move money.** Prompts under *Payments & transfers*, *Foreign exchange* (the exchange action), and *Sandbox* create or move funds. In the sandbox these are simulated, but treat them as real — and never point this server at a production account without understanding what each request does.

---

## Authentication

A two-step browser flow. See the [Authentication guide](../getting-started/authentication.md) for the full walkthrough.

```
Call setup_auth.
```

The assistant returns a Revolut authorization URL. Open it in your browser, approve access (and complete any identity check), then copy the `code` query parameter from the page you land on (e.g. `https://example.com/?code=oa_sand_abc123...`).

```
Call complete_auth with the code oa_sand_abc123...
```

```
I've approved access — here's the redirect URL, please finish signing in:
https://example.com/?code=oa_sand_abc123...
```

The `code` is single-use and expires within a couple of minutes, so complete this promptly. Once done, tokens are saved and refreshed automatically.

---

## Accounts

```
List my Revolut Business accounts with their balances.
```

```
Which of my accounts has the highest balance, and what currency is it in?
```

```
Show me the details for my GBP account.
```

```
What are the bank details (IBAN, BIC, sort code) for my main GBP account so I can share them to receive a payment?
```

---

## Transactions

```
Show me my last 20 transactions.
```

```
List all card payments from this account in May 2026.
```

```
What transactions went through between 2026-05-01 and 2026-05-31?
```

```
Show only transfers, the 50 most recent.
```

```
Pull up the full details of that last transaction, including each leg and the running balance.
```

---

## Counterparties

Counterparties are your saved payees — other Revolut users (by Revtag) or external bank accounts.

```
List all my saved counterparties.
```

```
Show me the details and linked accounts for the counterparty named "Acme Supplies".
```

```
Add a new counterparty: a UK business called "Acme Supplies Ltd", GBP, account number 12345678, sort code 04-00-75.
```

```
Save a Revolut counterparty for the Revtag @janedoe (personal profile).
```

```
Delete the counterparty for "Old Vendor" — I don't pay them anymore.
```

> Creating and deleting counterparties are write operations; deletion is irreversible.

---

## Payments & transfers

> ⚠️ These move money. In the sandbox the funds are simulated, but the requests behave like the real thing — confirm the amount, currency, source account, and payee before approving.

```
Pay 150 GBP from my main account to the "Acme Supplies Ltd" counterparty, reference "Invoice 1042".
```

```
Send 75.50 EUR to @janedoe from my EUR account.
```

```
Move 500 GBP from my main GBP account to my savings account.
```

```
Show me any pending payment drafts awaiting approval.
```

```
I'm paying a supplier in the US in USD — what transfer reason codes are valid for that?
```

```
Cancel that scheduled transfer I set up earlier.
```

> Some destinations/currencies require a valid **transfer reason** — ask for the reasons (as above) if a payment is rejected for a missing reason.

---

## Foreign exchange

The rate lookup is read-only; the exchange action moves money between your own accounts.

```
What's Revolut's live rate to convert 1000 GBP to USD right now, including the fee?
```

```
How much EUR would I get for 250 GBP today?
```

```
Exchange 200 GBP from my GBP account into USD in my USD account.
```

```
Buy exactly 300 USD into my USD account, funded from my GBP account.
```

> ⚠️ The exchange action moves funds between two of your own accounts. The rate lookup does not.

---

## Team

```
List the members of my Revolut Business team with their roles and email addresses.
```

```
Who on the team has an active account, and what role is each person assigned?
```

---

## Sandbox (test-data top-ups)

These helpers only work when `REVOLUT_ENVIRONMENT=sandbox`. Use them to generate data to experiment with.

```
Top up my GBP account with 1,000 GBP of test funds so I have something to work with.
```

```
Add 500 EUR of simulated money to my EUR account, then list my accounts to confirm the new balance.
```

```
Simulate a top-up that ends in the "pending" state on my main account.
```

```
Drive that pending transaction to "completed".
```

```
Mark that test payment as "failed" so I can see how a failed transfer looks.
```

> Outside the sandbox these tools refuse to run.

---

## Tips

- **Be specific about amounts and currencies** for any money-moving request, and re-read the assistant's summary before approving.
- You can chain steps in one prompt, e.g. *"Top up my GBP account with 1,000 GBP, then list my transactions."*
- If a tool reports it needs authentication, run the [Authentication](#authentication) steps and try again.
- For the exact parameters each tool accepts, see the reference docs under `docs/reference/`.
