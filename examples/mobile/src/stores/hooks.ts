import { createStoreHooks } from '@nexigen/entity-normalizer';

import { type rootStore } from './index';

export const { useStores, useServices, useStore, useService, useCore } =
  createStoreHooks<typeof rootStore>();
