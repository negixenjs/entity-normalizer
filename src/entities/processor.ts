
import { PREFIX } from './constants';
import { createNormalizer } from './normalize';
import { META } from '../constants/values';

import type { GetEntity, TEntitiesStore, EntityProcessOptions } from './types';
import type { TSchemaMap } from '../root/types';

export class EntityProcessor {
  private readonly getEntity: GetEntity;

  constructor(
    private entities: TEntitiesStore,
    private schemaMap: TSchemaMap,
  ) {
    this.getEntity = entities.getEntity.bind(entities);
  }

  // ===== meta =====

  private ensureMeta(instance: any) {
    let meta = instance[META];

    if (!meta) {
      meta = {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        accessedAt: Date.now(),
        refSources: new Set<string>(),
      };

      Object.defineProperty(instance, META, {
        value: meta,
        enumerable: false,
        writable: true,
      });
    }

    return meta as {
      createdAt: number;
      updatedAt: number;
      accessedAt: number;
      refSources: Set<string>;
    };
  }

  // ===== upsert =====

  private upsert(
    dto: any,
    schema: any,
    entityKey: string,
    id: string,
    opts: {
      hydrate: boolean;
      sourceRefId?: string;
      snapshot?: any;
    },
  ) {
    const existing = this.entities.getEntity(entityKey, id);

    if (opts.hydrate) {
      const instance = schema.model
        ? new schema.model(dto, this.getEntity)
        : { ...dto };

      const meta = this.ensureMeta(instance);

      if (opts.snapshot) {
        meta.createdAt = opts.snapshot.createdAt ?? meta.createdAt;
        meta.updatedAt = opts.snapshot.updatedAt ?? meta.updatedAt;
        meta.accessedAt = opts.snapshot.accessedAt ?? meta.accessedAt;

        const restoredRefs = opts.snapshot.refSources ?? [];
        for (const ref of restoredRefs) {
          meta.refSources.add(ref);
        }
      }

      return instance;
    }

    const processed = schema.process({ ...dto });

    if (existing) {
      if (existing.__partial) {
        delete existing.__partial;
      }

      schema.merge(existing, processed);

      const meta = this.ensureMeta(existing);
      const now = Date.now();

      meta.updatedAt = now;
      meta.accessedAt = now;

      if (opts.sourceRefId) {
        meta.refSources.add(opts.sourceRefId);
      }

      return existing;
    }

    const instance = schema.model
      ? new schema.model(processed, this.getEntity)
      : { ...processed };

    const meta = this.ensureMeta(instance);

    if (opts.sourceRefId) {
      meta.refSources.add(opts.sourceRefId);
    }

    return instance;
  }

  // ===== hydrate =====

  hydrate(snapshot: Record<string, Record<string, any>> | null | undefined) {
    if (!snapshot) {
      return;
    }

    const out: Record<string, any> = {};

    for (const entityKey of Object.keys(snapshot)) {
      const schema = this.schemaMap[entityKey];
      if (!schema) {
        if (__DEV__) {
          console.warn(
            `[hydrate] Schema not found for entityKey="${entityKey}". Skipping.`,
          );
        }
        continue;
      }

      const bucket = snapshot[entityKey];
      if (!bucket) {
        continue;
      }

      const restored: Record<string, any> = {};

      for (const id of Object.keys(bucket)) {
        const full = bucket[id];
        if (!full) {
          continue;
        }

        const { [META]: meta, ...dto } = full;

        restored[id] = this.upsert(dto, schema, entityKey, id, {
          hydrate: true,
          snapshot: meta,
        });
      }

      out[entityKey] = restored;
    }

    this.entities.merge(out);
  }

  // ===== process =====

  process<T>({
    data,
    entityKey,
    sourceRefId,
    isCollection,
  }: EntityProcessOptions<T>) {
    const schema = this.schemaMap[entityKey];

    if (!schema) {
      if (__DEV__) {
        console.warn(
          `[process] Schema not found for entityKey="${entityKey}". Skipping.`,
        );
      }
      return [];
    }

    const safeSourceRefId =
      sourceRefId && typeof sourceRefId === 'string' ? sourceRefId : 'unknown';

    const refId = isCollection
      ? `${PREFIX.COLLECTION}${safeSourceRefId}`
      : `${PREFIX.RECORD}${safeSourceRefId}`;

    const { ids, map } = createNormalizer().normalize(data, schema);

    const out: Record<string, any> = {};

    for (const key of Object.keys(map)) {
      const bucket = map[key];
      if (!bucket) {
        continue;
      }

      const schema = this.schemaMap[key];
      if (!schema) {
        continue;
      }

      const result: Record<string, any> = {};

      for (const id of Object.keys(bucket)) {
        result[id] = this.upsert(bucket[id], schema, key, id, {
          hydrate: false,
          sourceRefId: refId,
        });
      }

      out[key] = result;
    }

    this.entities.merge(out);
    return ids;
  }
}

// ===== factories =====

export function createEntityProcessor(
  entities: TEntitiesStore,
  schemaMap: TSchemaMap,
  options: EntityProcessOptions<any>,
) {
  if (!entities) {
    throw new Error('createEntityProcessor: EntitiesStore is required.');
  }
  return new EntityProcessor(entities, schemaMap).process(options);
}

export function createEntityRestorer(
  entities: TEntitiesStore,
  schemaMap: TSchemaMap,
) {
  if (!entities) {
    throw new Error('createEntityRestorer: EntitiesStore is required.');
  }
  const p = new EntityProcessor(entities, schemaMap);
  return (snapshot: any) => p.hydrate(snapshot);
}
