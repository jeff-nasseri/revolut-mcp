import { SignJWT, importPKCS8 } from "jose";
import { randomUUID } from "node:crypto";
import https from "node:https";
import { Config } from "../config.js";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

export class AuthClient {
  private config: Config;
  private tokenCache: Map<string, CachedToken> = new Map();

  constructor(config: Config) {
    this.config = config;
  }

  async getAccessToken(scope: "accounts" | "payments"): Promise<string> {
    const cached = this.tokenCache.get(scope);
    // Refresh 60 seconds before expiry
    if (cached && cached.expiresAt > Date.now() + 60_000) {
      return cached.accessToken;
    }

    const token = await this.requestToken(scope);
    this.tokenCache.set(scope, {
      accessToken: token.access_token,
      expiresAt: Date.now() + token.expires_in * 1000,
    });

    return token.access_token;
  }

  private async createClientAssertion(): Promise<string> {
    const privateKey = await importPKCS8(this.config.signingKey, "PS256");
    const tokenEndpoint = `${this.config.tokenUrl}/token`;

    const jwt = await new SignJWT({})
      .setProtectedHeader({
        alg: "PS256",
        kid: this.config.signingKeyId,
      })
      .setIssuer(this.config.clientId)
      .setSubject(this.config.clientId)
      .setAudience(tokenEndpoint)
      .setExpirationTime("5m")
      .setIssuedAt()
      .setJti(randomUUID())
      .sign(privateKey);

    return jwt;
  }

  private async requestToken(scope: string): Promise<TokenResponse> {
    const clientAssertion = await this.createClientAssertion();

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope,
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: clientAssertion,
    }).toString();

    return new Promise<TokenResponse>((resolve, reject) => {
      const url = new URL(`${this.config.tokenUrl}/token`);

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: "POST",
        cert: this.config.transportCert,
        key: this.config.transportKey,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data) as TokenResponse);
          } else {
            reject(
              new Error(
                `Token request failed with status ${res.statusCode}: ${data}`
              )
            );
          }
        });
      });

      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }
}
