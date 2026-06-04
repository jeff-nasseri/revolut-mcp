### Transactions

Transaction history and single-transaction detail.

#### `get_transactions`
Retrieves transaction history with optional account, date range, and type filtering. Each transaction includes its legs (per-account amount, description, and running balance).
- Parameters:
  - `account` (optional): Filter by account ID (UUID)
  - `from` (optional): Start date (YYYY-MM-DD)
  - `to` (optional): End date (YYYY-MM-DD)
  - `type` (optional): Filter by transaction type, e.g. transfer, card_payment, exchange, topup, fee
  - `count` (optional): Maximum number of transactions to return (1–1000, default 100)
- Example:
  ```
  get_transactions(type="card_payment", count=50)
  ```

#### `get_transaction`
Gets full details of a single transaction by ID, including type, state, timestamps, and all legs.
- Parameters:
  - `transactionId` (required): The transaction ID (UUID)
- Example:
  ```
  get_transaction(transactionId="00000000-0000-0000-0000-000000000000")
  ```
