import { CompactSign, importPKCS8 } from "jose";
import { Config } from "../config.js";

export class JwsSigner {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async sign(payload: string): Promise<string> {
    const privateKey = await importPKCS8(this.config.signingKey, "PS256");

    const encoder = new TextEncoder();
    const payloadBytes = encoder.encode(payload);

    const now = Math.floor(Date.now() / 1000);

    const jws = await new CompactSign(payloadBytes)
      .setProtectedHeader({
        alg: "PS256",
        kid: this.config.signingKeyId,
        b64: false,
        "http://openbanking.org.uk/iat": now,
        "http://openbanking.org.uk/iss": this.config.clientId,
        "http://openbanking.org.uk/tan": "openbanking.org.uk",
        crit: [
          "b64",
          "http://openbanking.org.uk/iat",
          "http://openbanking.org.uk/iss",
          "http://openbanking.org.uk/tan",
        ],
      })
      .sign(privateKey);

    // Return detached JWS: header..signature (payload removed)
    const parts = jws.split(".");
    return `${parts[0]}..${parts[2]}`;
  }
}
