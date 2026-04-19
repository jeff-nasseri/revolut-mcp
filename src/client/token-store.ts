import fs from 'fs';
import { StoredTokens } from '../types/revolut.js';

export class TokenStore {
  constructor(private readonly filePath: string) {}

  load(): StoredTokens | null {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(raw) as StoredTokens;
    } catch {
      return null;
    }
  }

  save(tokens: StoredTokens): void {
    fs.writeFileSync(this.filePath, JSON.stringify(tokens, null, 2), 'utf8');
  }

  clear(): void {
    try {
      fs.unlinkSync(this.filePath);
    } catch {
      // already absent
    }
  }

  isExpired(tokens: StoredTokens, bufferSeconds = 60): boolean {
    return Date.now() >= tokens.expiresAt - bufferSeconds * 1000;
  }
}
