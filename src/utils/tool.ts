import { z } from 'zod';
import { Config } from '../config.js';
import { RevolutAuth } from '../client/auth.js';
import { RevolutClient } from '../client/revolut-client.js';

/** Shared dependencies passed to every tool handler at call time. */
export interface ToolContext {
  config: Config;
  auth: RevolutAuth;
  client: RevolutClient;
}

/** MCP tool annotations (behavioural hints surfaced to clients). */
export interface ToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolDefinition<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  schema: TSchema;
  annotations?: ToolAnnotations;
  handler: (input: z.infer<TSchema>, ctx: ToolContext) => Promise<string>;
}

/** Identity helper that preserves the schema's inferred input type. */
export function defineTool<TSchema extends z.ZodTypeAny>(
  def: ToolDefinition<TSchema>
): ToolDefinition<TSchema> {
  return def;
}

/** A scope is simply a named collection of tools. */
export interface Scope {
  name: string;
  description: string;
  // `any` here intentionally: ToolDefinition is invariant in its schema generic,
  // so a heterogeneous list of differently-typed tools needs the erased element type.
  tools: ToolDefinition<any>[];
}
