import { EntityRecord } from './entity-record';

import type { CoreEntitiesAPI } from '../../root/coreApi/types';
import type { EntityCleanerStore } from '../cleaner';
import type { TEntitiesStore } from '../types';


export function createEntityRecord<T extends { id: string | number }, M>(
  options: { entityKey: string; recordId: string },
  system: {
    entities: TEntitiesStore;
    entitiesCleaner: EntityCleanerStore;
    notify: () => void;
    entitiesApi: CoreEntitiesAPI;
  },
) {
  return new EntityRecord<T, M>(options, system);
}
