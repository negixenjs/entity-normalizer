import { createStoreHooks } from '@nexigen/entity-normalizer';

import { type AppRootStore } from './root-store';

export const { useStores, useServices, useStore, useService, useCore } =
  createStoreHooks<AppRootStore>();