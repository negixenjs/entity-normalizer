import {
  createDuck,
  type MultiEntityCollection,
  type StoreDeps,
} from '@nexigen/entity-normalizer';
import { makeAutoObservable } from 'mobx';

import { type PostModel } from './model';
import { ENTITY_KEY, REF_SOURCE } from '../../constants';

import type { PostNormalizedDto } from './dto';

const PAGE_LIMIT = 20;

export class PostsStore {
  lists: MultiEntityCollection<PostNormalizedDto, PostModel>;

  constructor(
    private deps: StoreDeps<{
      api: any;
    }>,
  ) {
    this.lists = this.deps.core.entities.createMultiCollection<
      PostNormalizedDto,
      PostModel
    >({
      entityKey: ENTITY_KEY.POSTS,
      collectionId: REF_SOURCE.POSTS_FEED,
      limit: PAGE_LIMIT,
    });

    makeAutoObservable(this);
  }

  fetchPosts = createDuck(async ({ group, force }) => {
    const response = await this.deps.api.Posts.getPosts(
      {
        page: 1,
        limit: PAGE_LIMIT,
        group,
      },
      { type: 'list', force },
    );

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
