import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';
import path from 'path';

loadDotenv();

const ConfigSchema = z.object({
  clientId: z.string().min(1, 'REVOLUT_CLIENT_ID is required'),
  certPath: z.string().min(1, 'REVOLUT_CERT_PATH is required'),
  keyPath: z.string().min(1, 'REVOLUT_KEY_PATH is required'),
  signingKeyPath: z.string().optional(),
  redirectUri: z.string().url('REVOLUT_REDIRECT_URI must be a valid URL'),
  tokenStorePath: z.string().default('./.tokens.json'),
  environment: z.literal('sandbox').default('sandbox'),
});

function resolveAbsolute(p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

function buildConfig() {
  const parsed = ConfigSchema.safeParse({
    clientId: process.env.REVOLUT_CLIENT_ID,
    certPath: process.env.REVOLUT_CERT_PATH,
    keyPath: process.env.REVOLUT_KEY_PATH,
    signingKeyPath: process.env.REVOLUT_SIGNING_KEY_PATH,
    redirectUri: process.env.REVOLUT_REDIRECT_URI ?? 'https://localhost:3000/callback',
    tokenStorePath: process.env.TOKEN_STORE_PATH,
    environment: process.env.REVOLUT_ENVIRONMENT,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid configuration:\n${issues}\n\nCopy .env.sandbox.template → .env and fill in your values.`);
  }

  const data = parsed.data;

  return {
    ...data,
    certPath: resolveAbsolute(data.certPath),
    keyPath: resolveAbsolute(data.keyPath),
    signingKeyPath: data.signingKeyPath ? resolveAbsolute(data.signingKeyPath) : undefined,
    tokenStorePath: resolveAbsolute(data.tokenStorePath),
    baseUrl: 'https://sandbox-oba.revolut.com',
    authUrl: 'https://sandbox-oba-auth.revolut.com',
    authUiUrl: 'https://sandbox-oba.revolut.com/ui/index.html',
  } as const;
}

export type Config = ReturnType<typeof buildConfig>;

let _config: Config | null = null;

export function getConfig(): Config {
  if (!_config) _config = buildConfig();
  return _config;
}

export function resetConfig(): void {
  _config = null;
}
