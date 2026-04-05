import { readFileSync } from "node:fs";

export interface Config {
  environment: "sandbox" | "production";
  clientId: string;
  signingKey: string;
  signingKeyId: string;
  transportCert: string;
  transportKey: string;
  redirectUri: string;
  baseUrl: string;
  tokenUrl: string;
  financialId: string;
}

const FINANCIAL_ID = "001580000103UAvAAM";

const BASE_URLS: Record<string, string> = {
  sandbox: "https://sandbox-oba.revolut.com",
  production: "https://oba.revolut.com",
};

const AUTH_URLS: Record<string, string> = {
  sandbox: "https://sandbox-oba-auth.revolut.com",
  production: "https://oba-auth.revolut.com",
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readPemFile(path: string): string {
  try {
    return readFileSync(path, "utf-8");
  } catch (err) {
    throw new Error(
      `Failed to read PEM file at ${path}: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export function loadConfig(): Config {
  const environment = (process.env.REVOLUT_ENVIRONMENT || "sandbox") as
    | "sandbox"
    | "production";

  if (environment !== "sandbox" && environment !== "production") {
    throw new Error(
      `Invalid REVOLUT_ENVIRONMENT: ${environment}. Must be 'sandbox' or 'production'.`
    );
  }

  const clientId = requireEnv("REVOLUT_CLIENT_ID");
  const signingKeyPath = requireEnv("REVOLUT_SIGNING_KEY");
  const signingKeyId = requireEnv("REVOLUT_SIGNING_KEY_ID");
  const transportCertPath = requireEnv("REVOLUT_TRANSPORT_CERT");
  const transportKeyPath = requireEnv("REVOLUT_TRANSPORT_KEY");
  const redirectUri = requireEnv("REVOLUT_REDIRECT_URI");

  return {
    environment,
    clientId,
    signingKey: readPemFile(signingKeyPath),
    signingKeyId,
    transportCert: readPemFile(transportCertPath),
    transportKey: readPemFile(transportKeyPath),
    redirectUri,
    baseUrl: BASE_URLS[environment],
    tokenUrl: AUTH_URLS[environment],
    financialId: FINANCIAL_ID,
  };
}
