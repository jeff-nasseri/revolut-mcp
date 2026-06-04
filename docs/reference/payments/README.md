### Payments

Payments and transfers: drafts, transfer reasons, pay a counterparty, move money between your accounts, and cancel scheduled transactions.

#### `get_payment_drafts`
Lists pending payment drafts (payment orders awaiting approval).
- Parameters: None
- Example:
  ```
  get_payment_drafts()
  ```

#### `get_transfer_reasons`
Lists valid transfer reason codes (required for transfers/payments to certain countries and currencies). Optionally filter by country and/or currency.
- Parameters:
  - `country` (optional): Filter by counterparty country (ISO 3166-1 alpha-2)
  - `currency` (optional): Filter by currency (ISO 4217)
- Example:
  ```
  get_transfer_reasons(country="GB", currency="GBP")
  ```

#### `create_payment`
Sends a payment from one of your accounts to a counterparty (payee). This moves money out of the account and is a write operation.

> ⚠️ **Write operation** — moves money / changes state.

- Parameters:
  - `account_id` (required): Source account ID (UUID) to debit
  - `counterparty_id` (required): Counterparty (payee) ID to pay
  - `counterparty_account_id` (optional): Specific counterparty account ID (UUID); required when the counterparty has multiple accounts
  - `amount` (required): Amount to pay
  - `currency` (required): Payment currency (ISO 4217)
  - `reference` (optional): Payment reference shown to the recipient
  - `request_id` (optional): Idempotency key; a UUID is generated automatically if omitted
- Example:
  ```
  create_payment(account_id="...", counterparty_id="...", amount=100.00, currency="GBP")
  ```

#### `transfer_between_accounts`
Transfers money between two of your own Revolut Business accounts. This moves money and is a write operation.

> ⚠️ **Write operation** — moves money / changes state.

- Parameters:
  - `source_account_id` (required): Source account ID (UUID) to debit
  - `target_account_id` (required): Target account ID (UUID) to credit (must be one of your own accounts)
  - `amount` (required): Amount to transfer
  - `currency` (required): Transfer currency (ISO 4217)
  - `reference` (optional): Transfer reference
  - `request_id` (optional): Idempotency key; a UUID is generated automatically if omitted
- Example:
  ```
  transfer_between_accounts(source_account_id="...", target_account_id="...", amount=50.00, currency="GBP")
  ```

#### `cancel_transaction`
Cancels a scheduled or pending transaction (payment/transfer) by ID. This is a destructive operation.

> ⚠️ **Destructive** — irreversible.

- Parameters:
  - `transactionId` (required): The transaction ID (UUID) to cancel
- Example:
  ```
  cancel_transaction(transactionId="00000000-0000-0000-0000-000000000000")
  ```
