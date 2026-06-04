import { z } from 'zod';
import { zodToJsonSchema } from '../src/utils/json-schema.js';

describe('zodToJsonSchema', () => {
  it('converts objects with required, optional, default, and described fields', () => {
    const schema = z.object({
      a: z.string().describe('A field'),
      b: z.number().optional(),
      c: z.boolean().default(true),
    });
    const json = zodToJsonSchema(schema) as any;
    expect(json.type).toBe('object');
    expect(json.properties.a).toEqual({ type: 'string', description: 'A field' });
    expect(json.properties.b).toEqual({ type: 'number' });
    expect(json.properties.c.type).toBe('boolean');
    expect(json.properties.c.default).toBe(true);
    expect(json.required).toEqual(['a']);
  });

  it('handles enums and arrays', () => {
    const schema = z.object({
      kind: z.enum(['x', 'y']),
      tags: z.array(z.string()),
    });
    const json = zodToJsonSchema(schema) as any;
    expect(json.properties.kind).toEqual({ type: 'string', enum: ['x', 'y'] });
    expect(json.properties.tags).toEqual({ type: 'array', items: { type: 'string' } });
    expect(json.required.sort()).toEqual(['kind', 'tags']);
  });

  it('produces an empty object schema with no required array', () => {
    const json = zodToJsonSchema(z.object({})) as any;
    expect(json).toEqual({ type: 'object', properties: {} });
  });
});
