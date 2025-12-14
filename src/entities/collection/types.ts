import type { CoreEntitiesAPI } from '../../root/coreApi/types';
import type { EntityCleanerStore } from '../cleaner';
import type { TEntitiesStore } from '../types';
import type { EntityCollection } from './entity-collection';
import type { MULTI_COLLECTION_TAG } from './marker';

export interface SystemDeps {
  entities: TEntitiesStore;
  entitiesCleaner: EntityCleanerStore;
  notify: () => void;
  entitiesApi: CoreEntitiesAPI;
}
export interface EntityCollectionOptions<T> {
  entityKey: string;
  pageSize?: number;
  limit?: number;
  reversed?: boolean;
  hasNoMore?: boolean;
  idAttribute?: keyof T;
  collectionId: string;
}

export interface EntityCollectionSnapshot {
  items: (string | number)[];
  hasNoMore: boolean;
  reversed: boolean;
  limit: number;
}

export type GroupCollection<
  T extends { id: string | number },
  M,
> = EntityCollection<T, M>;

export interface MultiCollection<T extends { id: string | number }, M> {
  [key: string]: GroupCollection<T, M> | any;

  ensureGroup(group: string): GroupCollection<T, M>;
  getSubCollections(): Map<string, GroupCollection<T, M>>;
  getMultiSnapshot(): Record<string, EntityCollectionSnapshot>;
  applyMultiSnapshot(snap: Record<string, EntityCollectionSnapshot>): void;

  [MULTI_COLLECTION_TAG]: true;
}
