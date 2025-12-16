import { makeAutoObservable } from 'mobx';

import { ENTITY_KEY } from '../../constants';

import type { PostNormalizedDto } from './dto';
import type { EntityGetter } from '@nexigen/entity-normalizer';

export class PostModel {
  id: string;
  viewerId: string;
  title: string;
  commentsId?: string[];

  constructor(
    dto: PostNormalizedDto,
    private readonly get: EntityGetter,
  ) {
    this.id = dto.id;
    this.title = dto.title;
    this.viewerId = dto.viewerId;
    this.commentsId = dto.commentsId;

    makeAutoObservable(this, {}, { autoBind: true });
  }

  get viewer() {
    return this.get(ENTITY_KEY.VIEWERS, this.viewerId);
  }

  get shortTitle() {
    return this.title.slice(0, 3) + '…';
  }
}
