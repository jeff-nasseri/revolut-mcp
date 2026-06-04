### Accounts

Business accounts: list accounts with balances and inspect bank details.

#### `get_accounts`
Lists all Revolut Business accounts with their balance, currency, and state. Requires authentication.
- Parameters: None
- Example:
  ```
  get_accounts()
  ```

#### `get_account`
Gets a single Revolut Business account by ID, including its balance and state.
- Parameters:
  - `accountId` (required): The Revolut account ID (UUID)
- Example:
  ```
  get_account(accountId="00000000-0000-0000-0000-000000000000")
  ```

#### `get_account_bank_details`
Gets the bank details for a specific account — IBAN/BIC and/or local account number + sort code, supported schemes, and estimated settlement times.
- Parameters:
  - `accountId` (required): The Revolut account ID (UUID)
- Example:
  ```
  get_account_bank_details(accountId="00000000-0000-0000-0000-000000000000")
  ```
