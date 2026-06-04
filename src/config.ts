import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';
import path from 'path';

loadDotenv();

const EnvironmentSchema = z.enum(['sandbox', 'production']).default('sandbox');

const ConfigSchema = z.object({
  clientId: z.string().min(1, 'REVOLUT_CLIENT_ID is required'),
  privateKey: z.string().optional(),
  privateKeyPath: z.string().optional(),
  jwtIssuer: z.string().optional(),
  jwtAudience: z.string().default('https://revolut.com'),
  redirectUri: z.string().url('REVOLUT_REDIRECT_URI must be a valid URL'),
  tokenStorePath: z.string().default('./.tokens.json'),
  environment: EnvironmentSchema,
});

const ENDPOINTS = {
  sandbox: {
    apiBaseUrl: 'https://sandbox-b2b.revolut.com/api/1.0',
    authBaseUrl: 'https://sandbox-business.revolut.com',
  },
  production: {
    apiBaseUrl: 'https://b2b.revolut.com/api/1.0',
    authBaseUrl: 'https://business.revolut.com',
  },
} as const;

function resolveAbsolute(p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

function deriveIssuer(redirectUri: string, explicit?: string): string {
  if (explicit && explicit.trim()) return explicit.trim();
  try {
    return new URL(redirectUri).hostname;
  } catch {
    return redirectUri;
  }
}

function buildConfig() {
  const parsed = ConfigSchema.safeParse({
    clientId: process.env.REVOLUT_CLIENT_ID,
    privateKey: process.env.REVOLUT_PRIVATE_KEY,
    privateKeyPath: process.env.REVOLUT_PRIVATE_KEY_PATH,
    jwtIssuer: process.env.REVOLUT_JWT_ISS,
    jwtAudience: process.env.REVOLUT_JWT_AUD,
    redirectUri: process.env.REVOLUT_REDIRECT_URI ?? 'https://example.com/',
    tokenStorePath: process.env.TOKEN_STORE_PATH,
    environment: process.env.REVOLUT_ENVIRONMENT,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `Invalid configuration:\n${issues}\n\nCopy .env.sandbox.template → .env and fill in your values.`
    );
  }

  const data = parsed.data;

  if (!data.privateKey && !data.privateKeyPath) {
    throw new Error(
      'Invalid configuration:\n  • Provide REVOLUT_PRIVATE_KEY (PEM contents) or REVOLUT_PRIVATE_KEY_PATH (path to the key file used to sign the client-assertion JWT).'
    );
  }

  const endpoints = ENDPOINTS[data.environment];

  return {
    clientId: data.clientId,
    privateKey: data.privateKey,
    privateKeyPath: data.privateKeyPath ? resolveAbsolute(data.privateKeyPath) : undefined,
    jwtIssuer: deriveIssuer(data.redirectUri, data.jwtIssuer),
    jwtAudience: data.jwtAudience,
    redirectUri: data.redirectUri,
    tokenStorePath: resolveAbsolute(data.tokenStorePath),
    environment: data.environment,
    apiBaseUrl: endpoints.apiBaseUrl,
    authBaseUrl: endpoints.authBaseUrl,
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
