import { makeAutoObservable } from 'mobx';

import type { ViewerDto } from './dto';

export class ViewerModel {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  email: string;

  constructor(dto: ViewerDto) {
    this.id = dto.id;
    this.name = dto.name;
    this.bio = dto.bio ?? '';
    this.avatarUrl = dto.avatarUrl ?? '';
    this.email = dto.email ?? '';

    makeAutoObservable(this, {}, { autoBind: true });
  }
}
