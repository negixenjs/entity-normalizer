import { makeAutoObservable } from 'mobx';

import { ENTITY_KEY } from '../../constants';

import type { CommentNormalizedDto } from './dto';
import type { EntityGetter } from '@nexigen/entity-normalizer';

export class CommentModel {
  id: string;
  text: string;
  viewerId: string;

  constructor(
    dto: CommentNormalizedDto,
    private readonly get: EntityGetter,
  ) {
    this.id = dto.id;
    this.text = dto.text;
    this.viewerId = dto?.viewerId;

    makeAutoObservable(this, {}, { autoBind: true });
  }

  get viewer() {
    return this.get(ENTITY_KEY.VIEWERS, this.viewerId);
  }
}
