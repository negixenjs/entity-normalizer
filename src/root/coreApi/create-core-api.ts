import { createEntitiesAPI } from './entities';
import { createLifecycleAPI } from './lifecycle';
import { createStoresAPI } from './stores';

import type {
  CoreAPI,
  CoreEntitiesDeps,
  CoreLifecycleDeps,
  CoreStoresDeps,
  CoreInternalAPI,
} from './types';

export function createCoreAPI<TStores extends Record<string, any>>(deps: {
  lifecycle: CoreLifecycleDeps;
  entities: CoreEntitiesDeps;
  stores: CoreStoresDeps<TStores>;
  __internal: CoreInternalAPI;
}): CoreAPI<TStores> {
  return {
    lifecycle: createLifecycleAPI(deps.lifecycle),
    entities: createEntitiesAPI(deps.entities),
    stores: createStoresAPI(deps.stores),
    __internal: deps.__internal,
  };
}
