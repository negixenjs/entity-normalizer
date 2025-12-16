import {
  createDuck,
  type MultiEntityCollection,
  type StoreDeps,
} from '@nexigen/entity-normalizer';
import { makeAutoObservable } from 'mobx';

import { type PostModel } from './model';
import { type Api } from '../../../../shared/api';
import { ENTITY_KEY, REF_SOURCE } from '../../constants';

import type { PostDto } from './dto';

const PAGE_LIMIT = 20;

export class PostsStore {
  lists: MultiEntityCollection<PostDto, PostModel>;

  constructor(
    private deps: StoreDeps<{
      api: typeof Api;
    }>,
  ) {
    this.lists = this.deps.core.entities.createMultiCollection<
      PostDto,
      PostModel
    >({
      entityKey: ENTITY_KEY.POSTS,
      collectionId: REF_SOURCE.POSTS_FEED,
      limit: PAGE_LIMIT,
    });

    makeAutoObservable(this);
  }

  fetchPosts = createDuck(async ({ group }) => {
    const response = await this.deps.api.Posts.getPosts({
      page: 1,
      limit: PAGE_LIMIT,
      group,
    });

    this.lists[group].set(response);
  });

  fetchMorePosts = createDuck(async ({ group }) => {
    if (this.lists[group].hasNoMore) {
      return;
    }

    const response = await this.deps.api.Posts.getPosts({
      page: this.lists[group].pageNumber,
      limit: this.lists[group].limit,
      group,
    });

    this.lists[group].append(response);
  });
}
