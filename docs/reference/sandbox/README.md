### Sandbox

Sandbox-only simulation helpers for generating and driving test data.

#### `simulate_topup`
Sandbox only. Tops up an account with simulated funds so you have test data to work with.

> 🧪 Sandbox only — requires `REVOLUT_ENVIRONMENT=sandbox`.

- Parameters:
  - `account_id` (required): Account ID (UUID) to top up
  - `amount` (required): Amount to add
  - `currency` (required): Currency (ISO 4217) — must match the account currency
  - `reference` (optional): Optional reference for the top-up
  - `state` (optional): Simulated resulting state (default: completed)
  - `request_id` (optional): Idempotency key; a UUID is generated automatically if omitted
- Example:
  ```
  simulate_topup(account_id="...", amount=1000, currency="GBP")
  ```

#### `simulate_transaction_state`
Sandbox only. Drives a transfer/payment transaction into a target state (complete, revert, decline, or fail) for testing state transitions.

> 🧪 Sandbox only — requires `REVOLUT_ENVIRONMENT=sandbox`.

- Parameters:
  - `transactionId` (required): The transaction ID (UUID) to update
  - `action` (required): State transition to simulate on the transaction
- Example:
  ```
  simulate_transaction_state(transactionId="...", action="complete")
  ```
