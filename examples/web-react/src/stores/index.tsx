import {
  createRootStore,
  registerRootStore,
  createStoreHooks,
} from '@nexigen/entity-normalizer';

import { schemaMap } from './schema-map';
import { ViewerStore } from './viewer/store';

export const rootStore = createRootStore({
  api: {},
  schemaMap,
  stores: {
    viewer: ViewerStore,
  },
  services: {},
});

export const { useStores, useServices, useStore, useService, useCore } =
  createStoreHooks<typeof rootStore>();

registerRootStore(rootStore);
