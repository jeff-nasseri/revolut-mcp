import https from "node:https";
import { randomUUID } from "node:crypto";
import { Config } from "../config.js";
import { AuthClient } from "./auth.js";
import { JwsSigner } from "./jws.js";
import { OBErrorResponse } from "../types/common.js";

export interface RequestOptions {
  method: "GET" | "POST" | "DELETE";
  path: string;
  body?: unknown;
  scope: "accounts" | "payments";
  requireJws?: boolean;
  idempotencyKey?: string;
  contentType?: string;
}

export class HttpClient {
  private config: Config;
  private auth: AuthClient;
  private jws: JwsSigner;

  constructor(config: Config, auth: AuthClient, jws: JwsSigner) {
    this.config = config;
    this.auth = auth;
    this.jws = jws;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const accessToken = await this.auth.getAccessToken(options.scope);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "x-fapi-financial-id": this.config.financialId,
      "x-fapi-interaction-id": randomUUID(),
      Accept: "application/json",
    };

    let bodyStr: string | undefined;

    if (options.body) {
      bodyStr = JSON.stringify(options.body);
      headers["Content-Type"] = options.contentType || "application/json";
      headers["Content-Length"] = String(Buffer.byteLength(bodyStr));
    }

    if (options.requireJws && bodyStr) {
      headers["x-jws-signature"] = await this.jws.sign(bodyStr);
    }

    if (options.idempotencyKey) {
      headers["x-idempotency-key"] = options.idempotencyKey;
    }

    return new Promise<T>((resolve, reject) => {
      const url = new URL(`${this.config.baseUrl}${options.path}`);

      const reqOptions: https.RequestOptions = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: options.method,
        cert: this.config.transportCert,
        key: this.config.transportKey,
        headers,
      };

      const req = https.request(reqOptions, (res) => {
        let data = "";
        res.on("data", (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on("end", () => {
          if (res.statusCode === 204) {
            resolve(undefined as T);
            return;
          }

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data) as T);
          } else {
            let errorMessage: string;
            try {
              const errorResponse = JSON.parse(data) as OBErrorResponse;
              const errors = errorResponse.Errors?.map(
                (e) => `${e.ErrorCode}: ${e.Message}`
              ).join("; ");
              errorMessage = `${errorResponse.Message || "API Error"}${errors ? ` - ${errors}` : ""}`;
            } catch {
              errorMessage = data || `HTTP ${res.statusCode}`;
            }
            reject(
              new Error(
                `Revolut API error (${res.statusCode}): ${errorMessage}`
              )
            );
          }
        });
      });

      req.on("error", reject);

      if (bodyStr) {
        req.write(bodyStr);
      }

      req.end();
    });
  }

  async get<T>(path: string, scope: "accounts" | "payments" = "accounts"): Promise<T> {
    return this.request<T>({ method: "GET", path, scope });
  }

  async post<T>(
    path: string,
    body: unknown,
    options: {
      scope?: "accounts" | "payments";
      requireJws?: boolean;
      idempotencyKey?: string;
      contentType?: string;
    } = {}
  ): Promise<T> {
    return this.request<T>({
      method: "POST",
      path,
      body,
      scope: options.scope || "accounts",
      requireJws: options.requireJws,
      idempotencyKey: options.idempotencyKey,
      contentType: options.contentType,
    });
  }

  async delete(path: string, scope: "accounts" | "payments" = "accounts"): Promise<void> {
    return this.request<void>({ method: "DELETE", path, scope });
  }
}
