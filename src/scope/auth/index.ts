import { z } from 'zod';
import { defineTool, Scope } from '../../utils/tool.js';

const setupAuthSchema = z.object({});

const completeAuthSchema = z.object({
  code: z
    .string()
    .min(1)
    .describe('The authorization code from the redirect URL (the `code` query parameter)'),
});

export const authScope: Scope = {
  name: 'auth',
  description: 'Authorize the application and exchange the authorization code for API tokens.',
  tools: [
    defineTool({
      name: 'setup_auth',
      description:
        'Step 1 of authentication. Returns the Revolut Business URL to open in a browser to authorize access. After approval the browser is redirected to your redirect URI with a `code` query parameter.',
      schema: setupAuthSchema,
      annotations: { title: 'Set up authentication', readOnlyHint: true, openWorldHint: true },
      handler: async (_input, { auth }) => {
        const url = auth.buildAuthorizationUrl();
        return [
          'To authorize access to your Revolut Business account, open this URL in your browser:',
          '',
          url,
          '',
          'After approving (and completing any identity verification), the browser is redirected to your',
          'configured redirect URI with a `code` query parameter, e.g. https://example.com/?code=oa_sand_...',
          '',
          'Copy the `code` value and call the `complete_auth` tool with it. The code is single-use and',
          'expires within a couple of minutes, so complete this promptly.',
        ].join('\n');
      },
    }),
    defineTool({
      name: 'complete_auth',
      description:
        'Step 2 of authentication. Exchanges the authorization code for access + refresh tokens and persists them to the token store. Run after setup_auth.',
      schema: completeAuthSchema,
      annotations: { title: 'Complete authentication', readOnlyHint: false, openWorldHint: true },
      handler: async (input, { auth }) => {
        const tokens = await auth.exchangeCode(input.code);
        const expires = new Date(tokens.expiresAt).toISOString();
        return [
          'Authentication complete. Tokens have been saved.',
          `Access token expires at ${expires}.`,
          tokens.refreshToken
            ? 'A refresh token was stored — access tokens will be refreshed automatically.'
            : 'No refresh token was returned; you may need to re-authenticate when the access token expires.',
          '',
          'You can now use the account, transaction, counterparty, payment, FX, and team tools.',
        ].join('\n');
      },
    }),
  ],
};
