/* ======================================================
 * CORE — PUBLIC API
 * Everything domain stores & services ARE allowed to use
 * ====================================================== */

import type { EntityCollection } from '../../entities/collection/public';
import type { MultiEntityCollection } from '../../entities/collection/public';
import type { EntityId } from '../../entities/public';
import type { EntityRecord } from '../../entities/record/public';

/**
 * Snapshot of a single store
 * Shape is store-defined
 */
export type StoreSnapshot = Record<string, any>;

/**
 * Snapshot of all stores
 */
export type StoresSnapshot<TStores> = {
  [K in keyof TStores]?: StoreSnapshot;
};

/* ------------------------------------------------------
 * Entity processing
 * ------------------------------------------------------ */

export interface EntityProcessOptions<T> {
  data: T | T[];
  entityKey: string;
  sourceRefId: string;
  isCollection?: boolean;
}

/* ------------------------------------------------------
 * Core.Entities (PUBLIC)
 * ------------------------------------------------------ */

export type CoreEntitiesAPI = {
  /* ---------- factories ---------- */

  createRecord<T extends { id: EntityId }, M>(options: {
    entityKey: string;
    recordId: string;
  }): EntityRecord<T, M>;

  createCollection<T extends { id: EntityId }, M>(options: {
    entityKey: string;
    collectionId?: string;
    limit?: number;
    reversed?: boolean;
    hasNoMore?: boolean;
  }): EntityCollection<T, M>;

  createMultiCollection<T extends { id: EntityId }, M>(options: {
    entityKey: string;
    collectionId?: string;
    limit?: number;
    reversed?: boolean;
    hasNoMore?: boolean;
  }): MultiEntityCollection<T, M>;

  /* ---------- normalization ---------- */

  process<TDto>(options: EntityProcessOptions<TDto>): EntityId[];

  hydrate(
    snapshot: Record<string, Record<string, any>> | null | undefined,
  ): void;

  /* ---------- getters ---------- */

  get<T = any>(entityKey: string, id: EntityId): T | undefined;

  getAll<T = any>(entityKey: string): T[];

  getCount(entityKey: string): number;

  getSnapshot(): Record<string, any>;

  getSchema(entityKey: string): unknown;
};

/* ------------------------------------------------------
 * Core.Stores (PUBLIC)
 * ------------------------------------------------------ */

export type CoreStoresAPI<TStores> = {
  getSnapshot(): StoresSnapshot<TStores>;

  getSnapshotByKey<K extends keyof TStores>(key: K): StoresSnapshot<TStores>[K];

  applySnapshot(snapshot: StoresSnapshot<TStores>): void;

  applySnapshotByKey<K extends keyof TStores>(
    key: K,
    snapshot: StoresSnapshot<TStores>[K],
  ): void;

  resetAll(): void;

  resetByKey<K extends keyof TStores>(key: K): void;
};

/* ------------------------------------------------------
 * Core.Lifecycle (PUBLIC)
 * ------------------------------------------------------ */

export type CoreLifecycleAPI = {
  readonly isInitialized: boolean;
  setInitialized(v: boolean): void;
};

/* ------------------------------------------------------
 * Core API (PUBLIC)
 * ------------------------------------------------------ */

export type CoreAPI<TStores = {}> = {
  lifecycle: CoreLifecycleAPI;
  entities: CoreEntitiesAPI;
  stores: CoreStoresAPI<TStores>;
};
