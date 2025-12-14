import type { NormalizedOutput, EntityBuckets, AnySchema } from './types';

export class Normalizer {
  normalize(
    input: any | any[],
    schema: AnySchema | [AnySchema],
  ): NormalizedOutput {
    if (!input || (Array.isArray(input) && input.length === 0)) {
      return { map: {}, ids: [] };
    }

    const rootSchema = Array.isArray(schema) ? schema[0] : schema;

    const bucket: Partial<EntityBuckets> = {};
    const visited = new WeakMap<object, boolean>();

    const ids = this.runInternal(input, rootSchema, bucket, visited);

    return {
      map: bucket,
      ids,
    };
  }

  // ===== helpers =====

  private ensureBucket(
    bucket: Partial<EntityBuckets>,
    entityKey: string,
  ): Record<string, any> {
    if (!bucket[entityKey]) {
      bucket[entityKey] = {};
    }
    return bucket[entityKey]!;
  }

  // ===== normalize entity =====

  private normalizeEntity(
    raw: any,
    schema: AnySchema,
    bucket: Partial<EntityBuckets>,
    visited: WeakMap<object, boolean>,
  ): string | number {
    const id = schema.getId(raw);

    if (typeof raw === 'object' && raw !== null) {
      if (visited.has(raw)) {
        return id;
      }
      visited.set(raw, true);
    }

    const cleaned: any = { ...raw };

    for (const field in schema.definition) {
      const subschema = schema.definition[field] as AnySchema | [AnySchema];
      const isArray = Array.isArray(subschema);
      const childSchema = isArray ? subschema[0] : subschema;

      const idField = `${field}Id`;
      const nestedValue = raw[field];

      if (nestedValue) {
        const ids = this.runInternal(nestedValue, childSchema, bucket, visited);

        cleaned[idField] = isArray ? ids : ids[0];
        delete cleaned[field];
        continue;
      }

      const fallbackId = raw[idField];
      if (fallbackId) {
        const entityBucket = this.ensureBucket(bucket, childSchema.key);

        if (!entityBucket[fallbackId]) {
          entityBucket[fallbackId] = {
            id: fallbackId,
            __partial: true,
          };
        }

        cleaned[idField] = fallbackId;
      }
    }

    const entityBucket = this.ensureBucket(bucket, schema.key);
    entityBucket[id] = cleaned;

    return id;
  }

  // ===== normalize array =====

  private normalizeArray(
    list: any[],
    schema: AnySchema,
    bucket: Partial<EntityBuckets>,
    visited: WeakMap<object, boolean>,
  ) {
    return list.map(item =>
      this.normalizeEntity(item, schema, bucket, visited),
    );
  }

  // ===== recursive runner =====

  private runInternal(
    input: any,
    schema: AnySchema,
    bucket: Partial<EntityBuckets>,
    visited: WeakMap<object, boolean>,
  ): (string | number)[] {
    if (Array.isArray(input)) {
      return this.normalizeArray(input, schema, bucket, visited);
    }
    return [this.normalizeEntity(input, schema, bucket, visited)];
  }
}

// ===== factory =====

export function createNormalizer() {
  const instance = new Normalizer();

  return {
    normalize: (
      input: any,
      schema: AnySchema | [AnySchema],
    ): NormalizedOutput => instance.normalize(input, schema),
  };
}
