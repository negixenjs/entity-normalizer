import { makeAutoObservable, runInAction } from 'mobx';

import { PREFIX } from '../constants';
import { COLLECTION_TAG } from './marker';

import type {
  EntityCollectionOptions,
  EntityCollectionSnapshot,
  SystemDeps,
} from './types';
import type { CoreEntitiesAPI } from '../../root/coreApi/types';

export class EntityCollection<T extends { id: string | number }, M> {
  private entitiesApi: CoreEntitiesAPI;

  public [COLLECTION_TAG] = true;

  private items: (string | number)[] = [];
  private entityKey: string;
  private reversed: boolean;
  public limit: number;
  public hasNoMore: boolean;
  public collectionId: string;
  private notify: () => void;
  private entities: SystemDeps['entities'];
  private entitiesCleaner: SystemDeps['entitiesCleaner'];

  constructor(options: EntityCollectionOptions<T>, system: SystemDeps) {
    this.collectionId = options?.collectionId ?? '';
    this.entityKey = options.entityKey;
    this.notify = system.notify;
    this.entities = system.entities;
    this.entitiesCleaner = system.entitiesCleaner;
    this.entitiesApi = system.entitiesApi;
    this.limit = options.limit ?? 10;
    this.reversed = options.reversed ?? false;
    this.hasNoMore = options?.hasNoMore ?? false;

    makeAutoObservable(this, {}, { autoBind: true });
  }

  private sync() {
    this.notify();
  }

  // ---------------- NORMALIZATION ----------------

  private processData(data: T[]) {
    const ids = this.entitiesApi.process({
      data,
      entityKey: this.entityKey,
      sourceRefId: this.collectionId,
      isCollection: true,
    });

    return ids;
  }

  // ---------------- GETTERS ----------------

  get idAttribute() {
    return this.entitiesApi.getSchema(this.entityKey).getIdKey();
  }

  get asArray() {
    return this.items.slice();
  }

  get first() {
    return this.items[0];
  }

  get last() {
    return this.items[this.items.length - 1];
  }

  get count() {
    return this.items.length;
  }

  get isEmpty() {
    return this.items.length === 0;
  }

  get pageNumber() {
    return Math.floor(this.count / this.limit) + 1;
  }

  get offset() {
    return this.count;
  }

  get getList(): M[] {
    const results = this.items
      .map(id => this.entities.getEntity(this.entityKey, id) as M | undefined)
      .filter((item): item is M => !!item);

    //  lazy cleanup if there are missing items
    if (results.length !== this.items.length) {
      const schema = this.entitiesApi.getSchema(this.entityKey);
      const next = results.map(item => schema.getId(item));

      queueMicrotask(() => {
        runInAction(() => {
          this.items = next;
        });
      });
    }

    return results;
  }

  // ---------------- MODIFIERS ----------------

  set(data: T[]) {
    this.hasNoMore = false;
    const ids = this.processData(data);
    this.items = this.reversed ? [...ids].reverse() : [...ids];
    this.checkIfHasMore(data);
    this.sync();
  }

  append(data: T[]) {
    const ids = this.processData(data);
    this.items.push(...ids);
    this.checkIfHasMore(data);
    this.sync();
  }

  prepend(data: T[]) {
    const ids = this.processData(data);
    this.items.unshift(...ids);
    this.sync();
  }

  add(item: T) {
    const ids = this.processData([item]);
    if (this.reversed) {
      this.items.push(...ids);
    } else {
      this.items.unshift(...ids);
    }
    this.sync();
  }

  updateItem(item: T) {
    this.processData([item]);
    this.sync();
  }

  reset({ silent = false } = {}) {
    if (this.items.length > 0) {
      this.entitiesCleaner.deleteCascade(
        this.entityKey,
        [...this.items],
        `${PREFIX.COLLECTION}${this.collectionId}`,
      );
    }

    this.items = [];
    this.hasNoMore = false;

    if (!silent) {
      this.sync();
    }
  }

  removeById(id: string | number) {
    const index = this.findIndexById(id);
    if (index >= 0) {
      this.items.splice(index, 1);
      this.entitiesCleaner.deleteCascade(
        this.entityKey,
        [id],
        `${PREFIX.COLLECTION}${this.collectionId}`,
      );

      this.sync();
    }
  }

  removeIds(ids: (string | number)[]) {
    if (ids.length === 0) {
      return;
    }

    const set = new Set(ids);
    const toDelete = this.items.filter(id => set.has(id));

    if (toDelete.length === 0) {
      return;
    }

    this.items = this.items.filter(id => !set.has(id));
    this.entitiesCleaner.deleteCascade(
      this.entityKey,
      toDelete,
      `${PREFIX.COLLECTION}${this.collectionId}`,
    );

    this.sync();
  }

  setHasNoMore(value: boolean) {
    this.hasNoMore = value;
    this.sync();
  }

  // ---------------- HELPERS ----------------

  findById(id: string | number | undefined): M | undefined {
    if (!id) {
      return;
    }
    return this.entities.getEntity(this.entityKey, id) as M;
  }

  includes(item: T) {
    const schema = this.entitiesApi.getSchema(this.entityKey);
    const id = schema.getId(item);

    return this.items.includes(id);
  }

  findIndexById(id: string | number) {
    return this.items.findIndex(itemId => itemId === id);
  }

  checkIfHasMore(data: T[]) {
    const lessThanLimit = this.limit && data.length < this.limit;
    if (lessThanLimit) {
      this.hasNoMore = true;
    }
  }

  byIndex(index: number) {
    return this.items[index];
  }

  // --- SNAPSHOT API --- //

  getSnapshot(): EntityCollectionSnapshot {
    return {
      items: this.items,
      hasNoMore: this.hasNoMore,
      reversed: this.reversed,
      limit: this.limit,
    };
  }

  applySnapshot(snapshot: EntityCollectionSnapshot, { silent = false } = {}) {
    this.items = snapshot.items;
    this.hasNoMore = snapshot.hasNoMore;
    this.reversed = snapshot.reversed;
    this.limit = snapshot.limit;

    if (!silent) {
      this.sync();
    }
  }
}
