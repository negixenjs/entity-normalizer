import { makeAutoObservable, runInAction } from 'mobx';

import { PREFIX } from '../constants';
import { RECORD_TAG } from './marker';

import type { CoreEntitiesAPI } from '../../root/coreApi/types';
import type { EntityCleanerStore } from '../cleaner';
import type { TEntitiesStore } from '../types';
import type { EntityRecordSnapshot } from './types';

export class EntityRecord<T extends { id: string | number }, M> {
  private entitiesApi: CoreEntitiesAPI;

  public [RECORD_TAG] = true;

  private id: string | number | null = null;
  private entityKey: string;
  private entities: TEntitiesStore;
  private entitiesCleaner: EntityCleanerStore;
  private notify: () => void;
  public recordId: string;

  constructor(
    options: {
      entityKey: string;
      recordId: string;
    },
    system: {
      entities: TEntitiesStore;
      entitiesCleaner: EntityCleanerStore;
      notify: () => void;
      entitiesApi: CoreEntitiesAPI;
    },
  ) {
    this.entityKey = options.entityKey;
    this.recordId = options.recordId;
    this.entities = system.entities;
    this.entitiesCleaner = system.entitiesCleaner;
    this.notify = system.notify;
    this.entitiesApi = system.entitiesApi;

    makeAutoObservable(this, {}, { autoBind: true });
  }

  // ---------------- NORMALIZATION ----------------

  private process(item: T) {
    const ids = this.entitiesApi.process({
      data: [item],
      entityKey: this.entityKey,
      sourceRefId: this.recordId,
    });

    return ids[0];
  }

  private sync() {
    this.notify();
  }

  // ---------------- PUBLIC API ----------------

  set(item: T) {
    this.id = this.process(item);
    this.sync();
  }

  update(item: T) {
    this.process(item);
    this.sync();
  }

  reset() {
    if (this.id === null) {
      return;
    }

    this.entitiesCleaner.deleteCascade(
      this.entityKey,
      [this.id],
      `${PREFIX.RECORD}${this.recordId}`,
    );
    this.id = null;
    this.sync();
  }

  // ---------------- GETTERS ----------------

  get data(): M | undefined {
    if (!this.id) {
      return undefined;
    }

    const entity = this.entities.getEntity(this.entityKey, this.id) as
      | M
      | undefined;

    // lazy cleanup
    if (!entity) {
      queueMicrotask(() => {
        runInAction(() => {
          this.id = null;
          this.sync();
        });
      });

      return undefined;
    }

    return entity;
  }

  get entityId() {
    return this.id;
  }

  get exists() {
    return this.id !== null && this.data !== undefined;
  }

  get isEmpty() {
    return this.id === null;
  }

  // ---------------- SNAPSHOT ----------------

  getSnapshot(): EntityRecordSnapshot {
    return { id: this.id };
  }

  applySnapshot(snapshot: EntityRecordSnapshot) {
    this.id = snapshot.id;
    this.sync();
  }
}
