import { makeAutoObservable, observable } from 'mobx';

import { META } from '../constants/values';

import type { EntityBuckets, StoredEntity } from './types';

export class EntitiesStore {
  private buckets = new Map<string, Record<string, StoredEntity<any>>>();
  private onMergeCallbacks = new Set<() => void>();

  constructor() {
    Object.defineProperty(this, 'buckets', {
      enumerable: false,
      writable: true,
      configurable: false,
    });

    makeAutoObservable(
      this,
      {
        buckets: false,
        onMergeCallbacks: false,
        getSnapshot: false,
        getSnapshotKeys: false,
        getSnapshotByKey: false,

        reset: true,
      } as any,
      { autoBind: true },
    );
  }

  // ===== callbacks =====

  addOnMergeCallback(fn: () => void) {
    this.onMergeCallbacks.add(fn);
  }

  removeOnMergeCallback(fn: () => void) {
    this.onMergeCallbacks.delete(fn);
  }

  private triggerMergeCallbacks() {
    for (const fn of this.onMergeCallbacks) {
      fn();
    }
  }

  // ===== buckets =====

  private getBucket(key: string) {
    return this.buckets.get(key);
  }

  private ensureBucket(key: string) {
    let bucket = this.getBucket(key);
    if (!bucket) {
      bucket = observable.object<Record<string, StoredEntity<any>>>(
        {},
        {},
        { deep: false },
      );
      this.buckets.set(key, bucket);
    }
    return bucket;
  }

  // ===== merge =====

  merge(newEntities: Partial<EntityBuckets>) {
    for (const key in newEntities) {
      const bucket = this.ensureBucket(key);
      const incomingBucket = newEntities[key];
      if (!incomingBucket) {
        continue;
      }

      for (const id in incomingBucket) {
        const incoming = incomingBucket[id];
        const existing = bucket[id];

        if (existing) {
          Object.assign(existing, incoming);
        } else {
          bucket[id] = incoming;
        }
      }
    }

    this.triggerMergeCallbacks();
  }

  // ===== read =====

  hasEntity(entityKey: string, id: string | number) {
    return !!this.getBucket(entityKey)?.[id];
  }

  getEntity<T = any>(
    entityKey: string,
    id: string | number,
  ): StoredEntity<T> | undefined {
    const entity = this.getBucket(entityKey)?.[id];

    if (entity?.[META]) {
      entity[META].accessedAt = Date.now();
    }

    return entity;
  }

  getAll<T = any>(entityKey: string): StoredEntity<T>[] {
    const bucket = this.getBucket(entityKey);
    return bucket ? Object.values(bucket) : [];
  }

  getCount(entityKey: string): number {
    return Object.keys(this.getBucket(entityKey) ?? {}).length;
  }

  // ===== remove =====

  remove(entityKey: string, id: string | number) {
    const bucket = this.getBucket(entityKey);
    if (!bucket) {
      return;
    }

    delete bucket[id];
    this.triggerMergeCallbacks();
  }

  removeMany(toRemove: Record<string, Set<string>>) {
    for (const key in toRemove) {
      const bucket = this.getBucket(key);
      if (!bucket) {
        continue;
      }

      const ids = toRemove[key];
      if (!ids || ids.size === 0) {
        continue;
      }

      ids.forEach(id => {
        delete bucket[id];
      });
    }

    this.triggerMergeCallbacks();
  }

  // ===== reset =====

  reset(entityKey?: string) {
    if (entityKey) {
      this.buckets.set(entityKey, observable.object({}, {}, { deep: false }));
      return;
    }

    for (const key of this.buckets.keys()) {
      this.buckets.set(key, observable.object({}, {}, { deep: false }));
    }

    this.triggerMergeCallbacks();
  }

  // ===== snapshot =====

  get getSnapshot() {
    const out: Record<string, any> = {};

    for (const [key, bucket] of this.buckets.entries()) {
      out[key] = { ...bucket };
    }

    return out;
  }

  get getSnapshotKeys() {
    return Array.from(this.buckets.keys());
  }

  getSnapshotByKey(entityKey: string) {
    const bucket = this.getBucket(entityKey);
    if (!bucket) {
      return {};
    }

    const out: Record<string, any> = {};

    for (const [id, entity] of Object.entries(bucket)) {
      const { [META]: meta, ...rest } = entity as any;

      out[id] = {
        ...rest,
        [META]: meta
          ? {
              createdAt: meta.createdAt,
              updatedAt: meta.updatedAt,
              accessedAt: meta.accessedAt,
              refSources: Array.from(meta.refSources ?? []),
            }
          : undefined,
      };
    }

    return out;
  }
}
