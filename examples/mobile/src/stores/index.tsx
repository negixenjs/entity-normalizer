import {
  createRootStore,
  registerRootStore,
  createStoreHooks,
} from '@nexigen/entity-normalizer';

import { CommentsStore } from './comments/store';
import { PostsStore } from './posts/store';
import { schemaMap } from './schema-map';
import { ViewerStore } from './viewer/store';
import { Api } from '../../../shared/api';

export const rootStore = createRootStore({
  api: Api,
  schemaMap,
  stores: {
    viewer: ViewerStore,
    posts: PostsStore,
    comments: CommentsStore,
  },
  services: {},
});

export const { useStores, useServices, useStore, useService, useCore } =
  createStoreHooks<typeof rootStore>();

registerRootStore(rootStore);
