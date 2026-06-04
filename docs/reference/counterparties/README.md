### Counterparties

Saved payees (counterparties): list, inspect, create, and delete.

#### `get_counterparties`
Lists all saved counterparties (payees) with their accounts and identifiers.
- Parameters: None
- Example:
  ```
  get_counterparties()
  ```

#### `get_counterparty`
Gets a single counterparty by ID, including its linked accounts.
- Parameters:
  - `counterpartyId` (required): The counterparty ID (UUID)
- Example:
  ```
  get_counterparty(counterpartyId="00000000-0000-0000-0000-000000000000")
  ```

#### `create_counterparty`
Creates a new counterparty (payee). Provide a `revtag` for a Revolut counterparty, or external bank details (IBAN/BIC or account number + sort code, plus bank_country and currency). This is a write operation.

> ⚠️ **Write operation** — moves money / changes state.

- Parameters:
  - `name` (optional): Display name (used for Revtag counterparties or as a fallback label)
  - `profile_type` (optional): Profile type for a Revolut (Revtag) counterparty
  - `revtag` (optional): Revtag of a Revolut user — creates a Revolut counterparty
  - `company_name` (optional): Company name for an external business counterparty
  - `individual_first_name` (optional): First name for an external individual counterparty
  - `individual_last_name` (optional): Last name for an external individual counterparty
  - `bank_country` (optional): Bank country (ISO 3166-1 alpha-2), e.g. GB
  - `currency` (optional): Account currency (ISO 4217), e.g. GBP
  - `account_no` (optional): Local account number
  - `sort_code` (optional): UK sort code
  - `routing_number` (optional): US routing number
  - `iban` (optional): IBAN for SEPA/SWIFT counterparties
  - `bic` (optional): BIC/SWIFT code
  - `email` (optional): Counterparty email address
- Example:
  ```
  create_counterparty(revtag="@johndoe", profile_type="personal")
  ```

#### `delete_counterparty`
Deletes a counterparty (payee) by ID. This is a destructive, irreversible operation.

> ⚠️ **Destructive** — irreversible.

- Parameters:
  - `counterpartyId` (required): The counterparty ID (UUID)
- Example:
  ```
  delete_counterparty(counterpartyId="00000000-0000-0000-0000-000000000000")
  ```
