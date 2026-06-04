### Authentication

Authorize the application and exchange the authorization code for API tokens.

#### `setup_auth`
Step 1 of authentication. Returns the Revolut Business URL to open in a browser to authorize access. After approval the browser is redirected to your redirect URI with a `code` query parameter.
- Parameters: None
- Example:
  ```
  setup_auth()
  ```

#### `complete_auth`
Step 2 of authentication. Exchanges the authorization code for access + refresh tokens and persists them to the token store. Run after setup_auth.
- Parameters:
  - `code` (required): The authorization code from the redirect URL (the `code` query parameter)
- Example:
  ```
  complete_auth(code="oa_sand_...")
  ```
