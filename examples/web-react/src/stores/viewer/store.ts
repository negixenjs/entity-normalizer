import {
  createDuck,
  type EntityRecord,
  type StoreDeps,
} from '@nexigen/entity-normalizer';
import { makeAutoObservable } from 'mobx';

import { type ViewerModel } from './model';
import { type Api } from '../../api';
import { ENTITY_KEY, REF_SOURCE } from '../../constants';

import type { ViewerDto } from './dto';

export class ViewerStore {
  private current: EntityRecord<ViewerDto, ViewerModel>;
  private details: EntityRecord<ViewerDto, ViewerModel>;

  constructor(private deps: StoreDeps<{ api: typeof Api }>) {
    this.current = this.deps.core.entities.createRecord({
      entityKey: ENTITY_KEY.VIEWERS,
      recordId: REF_SOURCE.CURRENT_VIEWER,
    });

    this.details = this.deps.core.entities.createRecord({
      entityKey: ENTITY_KEY.VIEWERS,
      recordId: REF_SOURCE.VIEWER_DETAILS,
    });

    makeAutoObservable(this, {}, { autoBind: true });
  }

  get currentViewer() {
    return this.current.data;
  }

  get viewerDetails() {
    return this.details.data;
  }

  fetchCurrentViewer = createDuck(async () => {
    const dto = await this.deps.api.Viewer.getCurrentViewer();
    this.current.set(dto);
  });

  fetchViewerDetails = createDuck(async ({ id }: { id: string }) => {
    const dto = await this.deps.api.Viewer.getViewerById(id);
    this.details.set(dto);
  });
}
