import axios from 'axios';
import { ZodError } from 'zod';

/** Turn any thrown value into a concise, user-facing message. */
export function formatError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const detail = data
      ? typeof data === 'string'
        ? data
        : JSON.stringify(data)
      : error.message;
    return status ? `HTTP ${status}: ${detail}` : detail;
  }
  if (error instanceof ZodError) {
    return 'Invalid input: ' + error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
  }
  if (error instanceof Error) return error.message;
  return String(error);
}
