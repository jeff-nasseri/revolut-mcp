import { z } from 'zod';

export type JsonSchema = Record<string, unknown>;

/**
 * Minimal but faithful Zod → JSON Schema converter for MCP `inputSchema`.
 * Handles objects, strings, numbers, booleans, enums, literals, arrays,
 * records, and the optional/default/nullable/effects wrappers, preserving
 * `.describe()` text and surfacing `default` values.
 */
export function zodToJsonSchema(schema: z.ZodTypeAny): JsonSchema {
  const def: any = schema._def;

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value);
      if (!isOptionalField(value)) required.push(key);
    }
    const out: JsonSchema = { type: 'object', properties };
    if (required.length) out.required = required;
    if (def.description) out.description = def.description;
    return out;
  }

  if (
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodDefault ||
    schema instanceof z.ZodNullable
  ) {
    const inner = zodToJsonSchema(def.innerType);
    if (def.description && !inner.description) inner.description = def.description;
    if (schema instanceof z.ZodDefault) {
      try {
        inner.default = def.defaultValue();
      } catch {
        /* ignore non-evaluable defaults */
      }
    }
    return inner;
  }

  if (schema instanceof z.ZodEffects) {
    const inner = zodToJsonSchema(def.schema);
    if (def.description && !inner.description) inner.description = def.description;
    return inner;
  }

  const base: JsonSchema = {};
  if (def.description) base.description = def.description;

  if (schema instanceof z.ZodString) return { ...base, type: 'string' };
  if (schema instanceof z.ZodNumber) return { ...base, type: 'number' };
  if (schema instanceof z.ZodBoolean) return { ...base, type: 'boolean' };
  if (schema instanceof z.ZodEnum) return { ...base, type: 'string', enum: def.values };
  if (schema instanceof z.ZodNativeEnum) {
    return { ...base, type: 'string', enum: Object.values(def.values) };
  }
  if (schema instanceof z.ZodLiteral) return { ...base, const: def.value };
  if (schema instanceof z.ZodArray) {
    return { ...base, type: 'array', items: zodToJsonSchema(def.type) };
  }
  if (schema instanceof z.ZodRecord) return { ...base, type: 'object' };

  return { ...base, type: 'string' };
}

function isOptionalField(schema: z.ZodTypeAny): boolean {
  return (
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodDefault ||
    (schema instanceof z.ZodNullable && isOptionalField((schema._def as any).innerType))
  );
}
