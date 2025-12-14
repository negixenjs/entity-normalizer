import { BucketCollector } from './bucket';
import { SchemaWalker } from './walker';
import { META } from '../../constants/values';

import type { AnySchema, TEntitiesStore } from '../types';


export class EntityCleanerStore {
  private walker: SchemaWalker;
  private collector: BucketCollector;

  constructor(
    private entities: TEntitiesStore,
    schemaMap: Record<string, AnySchema>,
  ) {
    this.walker = new SchemaWalker(schemaMap);
    this.collector = new BucketCollector(entities, this.walker);
  }

  private canDelete(entityKey: string, id: string | number) {
    const live = this.entities.getEntity(entityKey, id);
    if (!live) {
      return false;
    }

    if (live.__partial) {
      return false;
    }

    const refs = live[META]?.refSources;
    return !refs || refs.size === 0;
  }

  private collectCascade(entityKey: string, ids: (string | number)[]) {
    const finalBucket: Record<string, Set<string>> = {} as any;

    for (const id of ids) {
      const bucket = this.collector.collect(entityKey, id);

      for (const key of Object.keys(bucket) as string[]) {
        if (!finalBucket[key]) {
          finalBucket[key] = new Set();
        }
        bucket[key].forEach(v => finalBucket[key].add(v));
      }
    }

    return finalBucket;
  }

  private filterBucket(bucket: Record<string, Set<string>>) {
    const filtered: Record<string, Set<string>> = {} as any;

    for (const key of Object.keys(bucket) as string[]) {
      for (const id of bucket[key]) {
        if (this.canDelete(key, id)) {
          if (!filtered[key]) {
            filtered[key] = new Set();
          }
          filtered[key].add(id);
        }
      }
    }

    return filtered;
  }

  private detachRefByPlan(
    bucket: Record<string, Set<string>>,
    sourceRefId: string,
  ) {
    for (const entityKey of Object.keys(bucket)) {
      for (const id of bucket[entityKey]) {
        const entity = this.entities.getEntity(entityKey, id);
        if (!entity) {
          continue;
        }

        const refs = entity[META]?.refSources;
        if (!refs) {
          continue;
        }

        refs.delete(sourceRefId);
      }
    }
  }

  deleteCascade(
    entityKey: string,
    ids: (string | number)[],
    sourceRefId: string,
  ) {
    if (!ids.length) {
      return;
    }

    const raw = this.collectCascade(entityKey, ids);
    this.detachRefByPlan(raw, sourceRefId);
    const toDetach = this.filterBucket(raw);

    this.entities.removeMany(toDetach);
  }
}
