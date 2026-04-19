import https from 'https';
import fs from 'fs';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Config } from '../config.js';
import { TokenStore } from './token-store.js';
import {
  OBConsentRequest,
  OBConsentResponse,
  StoredTokens,
  TokenResponse,
} from '../types/revolut.js';

const ACCOUNT_PERMISSIONS = [
  'ReadAccountsBasic',
  'ReadAccountsDetail',
  'ReadBalances',
  'ReadTransactionsCredits',
  'ReadTransactionsDebits',
  'ReadTransactionsDetail',
] as const;

export class RevolutAuth {
  private readonly store: TokenStore;
  private readonly mtlsAgent: https.Agent;

  constructor(private readonly config: Config) {
    this.store = new TokenStore(config.tokenStorePath);
    this.mtlsAgent = this.buildMtlsAgent();
  }

  private buildMtlsAgent(): https.Agent {
    return new https.Agent({
      cert: fs.readFileSync(this.config.certPath),
      key: fs.readFileSync(this.config.keyPath),
      rejectUnauthorized: true,
    });
  }

  private async fetchClientCredentialsToken(): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'accounts',
      client_id: this.config.clientId,
    });

    const response = await axios.post<TokenResponse>(
      `${this.config.authUrl}/token`,
      params.toString(),
      {
        httpsAgent: this.mtlsAgent,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    return response.data.access_token;
  }

  async createConsent(): Promise<string> {
    const clientToken = await this.fetchClientCredentialsToken();

    const body: OBConsentRequest = {
      Data: {
        Permissions: [...ACCOUNT_PERMISSIONS],
        ExpirationDateTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        TransactionFromDateTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        TransactionToDateTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      Risk: {},
    };

    const response = await axios.post<OBConsentResponse>(
      `${this.config.baseUrl}/account-access-consents`,
      body,
      {
        httpsAgent: this.mtlsAgent,
        headers: {
          Authorization: `Bearer ${clientToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.Data.ConsentId;
  }

  buildAuthorizationUrl(consentId: string): string {
    const signingKeyPath = this.config.signingKeyPath ?? this.config.keyPath;
    const signingKey = fs.readFileSync(signingKeyPath);
    const nonce = uuidv4();

    const claims = {
      iss: this.config.clientId,
      aud: this.config.baseUrl,
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'accounts',
      nonce,
      claims: {
        id_token: {
          openbanking_intent_id: { value: consentId, essential: true },
        },
      },
    };

    const requestJwt = jwt.sign(claims, signingKey, {
      algorithm: 'PS256',
      expiresIn: '1h',
    });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'accounts',
      nonce,
      request: requestJwt,
    });

    return `${this.config.authUiUrl}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<StoredTokens> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
    });

    const response = await axios.post<TokenResponse>(
      `${this.config.authUrl}/token`,
      params.toString(),
      {
        httpsAgent: this.mtlsAgent,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const tokens = this.tokenResponseToStored(response.data);
    this.store.save(tokens);
    return tokens;
  }

  async getValidAccessToken(): Promise<string> {
    const stored = this.store.load();
    if (!stored) throw new Error('Not authenticated. Run the setup_auth tool first.');

    if (!this.store.isExpired(stored)) return stored.accessToken;

    if (!stored.refreshToken) {
      this.store.clear();
      throw new Error('Session expired. Run setup_auth again to re-authenticate.');
    }

    return this.refreshAccessToken(stored.refreshToken);
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
    });

    const response = await axios.post<TokenResponse>(
      `${this.config.authUrl}/token`,
      params.toString(),
      {
        httpsAgent: this.mtlsAgent,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const tokens = this.tokenResponseToStored(response.data);
    this.store.save(tokens);
    return tokens.accessToken;
  }

  private tokenResponseToStored(response: TokenResponse): StoredTokens {
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: Date.now() + response.expires_in * 1000,
      scope: response.scope,
    };
  }

  getMtlsAgent(): https.Agent {
    return this.mtlsAgent;
  }
}
