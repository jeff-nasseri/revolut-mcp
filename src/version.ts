// Server identity reported to MCP clients. The version is read from package.json
// at runtime so it always matches the published package (CI sets package.json).
import { readFileSync } from 'fs';
import path from 'path';

export const SERVER_NAME = 'revolut-mcp';

function resolveVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
    ) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export const SERVER_VERSION = resolveVersion();
