import {
  createDuck,
  type EntityRecord,
  type StoreDeps,
} from '@nexigen/entity-normalizer';
import { makeAutoObservable } from 'mobx';

import { type ViewerModel } from './model';
import { ENTITY_KEY, REF_SOURCE } from '../../constants';

import type { ViewerDto } from './dto';

type Deps = StoreDeps<{
  api: {
    getCurrentViewer(): Promise<ViewerDto>;
  };
}>;

export class ViewerStore {
  private _isLoggedIn = false;
  private _viewer: EntityRecord<ViewerDto, ViewerModel>;

  constructor(private deps: Deps) {
    this._viewer = this.deps.core.entities.createRecord<ViewerDto, ViewerModel>(
      {
        entityKey: ENTITY_KEY.VIEWERS,
        recordId: REF_SOURCE.CURRENT_VIEWER,
      },
    );

    makeAutoObservable(this, {}, { autoBind: true });
  }

  // ---------- state ----------

  get isLoggedIn() {
    return this._isLoggedIn;
  }

  get viewer() {
    return this._viewer.data;
  }

  get viewerId() {
    return this._viewer.entityId;
  }

  // ---------- actions ----------

  setIsLoggedIn(isLoggedIn: boolean) {
    this._isLoggedIn = isLoggedIn;
  }

  reset() {
    this._isLoggedIn = false;
    this._viewer.reset();
  }

  // ---------- async ----------

  fetchCurrentViewer = createDuck(async () => {
    const dto = await this.deps.api.getCurrentViewer();

    this._viewer.set(dto);
    this.setIsLoggedIn(true);
  });
}
