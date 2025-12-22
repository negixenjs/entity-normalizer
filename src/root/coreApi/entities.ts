import {
  createEntityCollection,
  createMultiEntityCollection,
} from '../../entities/collection/create-entity-collection';
import {
  createEntityProcessor,
  createEntityRestorer,
} from '../../entities/processor';
import { createEntityRecord } from '../../entities/record/create-entity-record';

import type { CoreEntitiesAPI } from './types';
import type { EntityCleanerStore } from '../../entities/cleaner';
import type { MultiEntityCollection } from '../../entities/collection/public';
import type { EntityCollectionOptions } from '../../entities/collection/types';
import type { EntityRecord } from '../../entities/record/entity-record';
import type {
  EntitiesSnapshot,
  EntityProcessOptions,
  TEntitiesStore,
} from '../../entities/types';
import type { TSchemaMap, PersistenceNotifier } from '../types';

export function createEntitiesAPI(deps: {
  entities: TEntitiesStore;
  schemaMap: TSchemaMap;
  entitiesCleaner: EntityCleanerStore;
  getPersistence: () => PersistenceNotifier | undefined;
}): CoreEntitiesAPI {
  const { entities, entitiesCleaner, schemaMap, getPersistence } = deps;

  const notify = () => {
    getPersistence?.()?.onPointersChanged?.();
  };

  return {
    createRecord<T extends { id: string | number }, M>(options: {
      entityKey: string;
      recordId: string;
    }): EntityRecord<T, M> {
      return createEntityRecord<T, M>(options, {
        entities,
        notify,
        entitiesCleaner,
        entitiesApi: this,
      });
    },

    createCollection<T extends { id: string | number }, M>(
      options: EntityCollectionOptions<T>,
    ) {
      return createEntityCollection<T, M>(options, {
        entities,
        entitiesCleaner,
        notify,
        entitiesApi: this,
      });
    },

    createMultiCollection<T extends { id: string | number }, M>(
      options: EntityCollectionOptions<T>,
    ): MultiEntityCollection<T, M> {
      return createMultiEntityCollection<T, M>(options, {
        entities,
        entitiesCleaner,
        notify,
        entitiesApi: this,
      });
    },

    process<TDto, TKey extends string>(
      options: EntityProcessOptions<TDto> & { entityKey: TKey },
    ): Array<string | number> {
      return createEntityProcessor(entities, schemaMap, options);
    },

    hydrate(snapshot: EntitiesSnapshot | null | undefined): void {
      return createEntityRestorer(entities, schemaMap)(snapshot);
    },

    get<T extends string>(key: T, id: string | number) {
      return entities.getEntity(key, id) as any;
    },

    getAll<T extends string>(key: T) {
      return entities.getAll(key) as any;
    },

    getCount<T extends string>(key: T) {
      return entities.getCount(key);
    },

    getSnapshot() {
      return entities.getSnapshot;
    },

    getSchema<TKey extends string>(key: TKey) {
      return schemaMap[key];
    },
  };
}
