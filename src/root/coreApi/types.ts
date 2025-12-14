import type {
  EntityCollection,
  EntityProcessOptions,
  EntityRecord,
  TEntitiesStore,
} from '../../entities';
import type { EntityCleanerStore } from '../../entities/cleaner';
import type { MultiEntityCollection } from '../../entities/collection/public';
import type { EntityCollectionOptions } from '../../entities/collection/types';
import type { PersistenceNotifier, StoresSnapshot, TSchemaMap } from '../types';

export interface CoreAPIExtensions {}

export type CoreInternalAPI = {
  setPersistence(notifier: PersistenceNotifier): void;
};

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

export type CoreLifecycleAPI = {
  isInitialized: boolean;
  setInitialized(v: boolean): void;
};

export type CoreEntitiesAPI = {
  createRecord<T extends { id: string | number }, M>(options: {
    entityKey: string;
    recordId: string;
  }): EntityRecord<T, M>;

  createCollection<T extends { id: string | number }, M>(
    options: EntityCollectionOptions<T>,
  ): EntityCollection<T, M>;

  createMultiCollection<T extends { id: string | number }, M>(
    options: EntityCollectionOptions<T>,
  ): MultiEntityCollection<T, M>;

  process<TKey extends string, TDto>(
    options: EntityProcessOptions<TDto> & { entityKey: TKey },
  ): Array<string | number>;

  hydrate(
    snapshot: Record<string, Record<string, any>> | null | undefined,
  ): void;

  get<T extends string>(
    key: T,
    id: string | number,
  ): ReturnType<TEntitiesStore['getEntity']>;

  getAll<T extends string>(key: T): ReturnType<TEntitiesStore['getAll']>;

  getCount<T extends string>(key: T): number;

  getSnapshot(): Record<string, any>;

  getSchema<TKey extends string>(key: TKey): TSchemaMap[TKey];
};

export type CoreGCAPI = {
  bootstrap(): void;
  processOrphan(): void;
};

export type CoreAPI<TStores = {}> = CoreAPIExtensions & {
  lifecycle: CoreLifecycleAPI;
  entities: CoreEntitiesAPI;
  stores: CoreStoresAPI<TStores>;

  __internal: CoreInternalAPI;
};

export type CoreEntitiesDeps = {
  entities: TEntitiesStore;
  entitiesCleaner: EntityCleanerStore;
  schemaMap: TSchemaMap;

  //system api
  getPersistence: () => PersistenceNotifier | undefined;
};

export type CoreStoresDeps<TStores extends Record<string, any>> = {
  [K in keyof TStores]: InstanceType<TStores[K]>;
};

export type CoreLifecycleDeps = {
  getIsInitialized: () => boolean;
  setInitialized: (v: boolean) => void;
};
