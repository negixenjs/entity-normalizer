import { makeAutoObservable } from 'mobx';

import type { ViewerDto } from './dto';

export class ViewerModel {
  id: string;
  name: string;

  constructor(dto: ViewerDto) {
    this.id = dto.id;
    this.name = dto.name;

    makeAutoObservable(this, {}, { autoBind: true });
  }
}
