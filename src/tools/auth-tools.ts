import { z } from 'zod';
import { RevolutAuth } from '../client/auth.js';

export const setupAuthInputSchema = z.object({});

export const completeAuthInputSchema = z.object({
  code: z.string().describe('Authorization code from the Revolut redirect URL'),
});

export async function setupAuth(auth: RevolutAuth): Promise<string> {
  const consentId = await auth.createConsent();
  const authUrl = auth.buildAuthorizationUrl(consentId);

  return [
    '✅ Consent created successfully.',
    '',
    'Visit the URL below in your browser to authorize access to your Revolut account:',
    '',
    authUrl,
    '',
    'After authorization, Revolut will redirect you to your redirect URI with a `code` query parameter.',
    'Copy the `code` value and call the `complete_auth` tool with it.',
  ].join('\n');
}

export async function completeAuth(
  auth: RevolutAuth,
  input: z.infer<typeof completeAuthInputSchema>
): Promise<string> {
  await auth.exchangeCode(input.code);
  return '✅ Authentication complete. Tokens have been saved. You can now use all account tools.';
}
