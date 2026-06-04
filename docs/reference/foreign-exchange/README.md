### Foreign Exchange

Live exchange rates and currency exchange between your own accounts.

#### `get_exchange_rate`
Gets Revolut's live exchange rate between two currencies, including the converted amount and the fee that would apply.
- Parameters:
  - `from` (required): Source currency (ISO 4217), e.g. GBP
  - `to` (required): Target currency (ISO 4217), e.g. USD
  - `amount` (optional): Amount of the source currency to quote (defaults to 1 unit if omitted)
- Example:
  ```
  get_exchange_rate(from="GBP", to="USD", amount=100)
  ```

#### `exchange_currency`
Exchanges currency between two of your own accounts at the current rate. This moves money and is a write operation.

> ⚠️ **Write operation** — moves money / changes state.

- Parameters:
  - `from_account_id` (required): Source account ID (UUID) to debit
  - `to_account_id` (required): Target account ID (UUID) to credit
  - `from_currency` (required): Source currency (ISO 4217)
  - `to_currency` (required): Target currency (ISO 4217)
  - `amount` (required): Amount to exchange
  - `amount_side` (optional): Whether `amount` is the sell (from) amount or the buy (to) amount
  - `reference` (optional): Optional reference shown on the exchange
  - `request_id` (optional): Idempotency key; a UUID is generated automatically if omitted
- Example:
  ```
  exchange_currency(from_account_id="...", to_account_id="...", from_currency="GBP", to_currency="USD", amount=100)
  ```
