import {
  type EntityCollection,
  createDuck,
  type StoreDeps,
} from '@nexigen/entity-normalizer';
import { makeAutoObservable } from 'mobx';

import { type CommentDto } from './dto';
import { type CommentModel } from './model';
import { ENTITY_KEY, REF_SOURCE } from '../../constants';

export class CommentsStore {
  list: EntityCollection<CommentDto, CommentModel>;

  constructor(
    private deps: StoreDeps<{
      api: any;
    }>,
  ) {
    this.list = this.deps.core.entities.createCollection<
      CommentDto,
      CommentModel
    >({
      entityKey: ENTITY_KEY.COMMENTS,
      collectionId: REF_SOURCE.COMMENTS_FEED,
    });

    makeAutoObservable(this);
  }

  fetchComments = createDuck(async () => {
    const comments = await this.deps.api.Comments.getComments({
      page: this.list.pageNumber,
      limit: this.list.limit,
    });

    this.list.set(comments);
  });
}
