/** Snapshot shape for persistence */
export interface EntityCollectionSnapshot<Id = string | number> {
  items: Id[];
  hasNoMore: boolean;
  reversed: boolean;
  limit: number;
}

/** Read-only public view */
export interface EntityCollectionView<Id = string | number, M = any> {
  readonly idAttribute: string;

  readonly asArray: Id[];
  readonly first: Id | undefined;
  readonly last: Id | undefined;
  readonly count: number;
  readonly isEmpty: boolean;

  /** Pagination */
  readonly limit: number;
  readonly hasNoMore: boolean;
  readonly pageNumber: number;
  readonly offset: number;

  /** Resolved entities (may trigger lazy cleanup internally) */
  readonly getList: M[];

  findById(id: Id | undefined): M | undefined;
  findIndexById(id: Id): number;
  byIndex(index: number): Id | undefined;
  includes(item: any): boolean;
}

/** Mutable public API */
export interface EntityCollectionActions<T, Id = string | number> {
  set(data: T[]): void;
  append(data: T[]): void;
  prepend(data: T[]): void;
  add(item: T): void;
  updateItem(item: T): void;

  removeById(id: Id): void;
  removeIds(ids: Id[]): void;
  resolveById(tempId: Id, real: T): void;

  reset(): void;
  setHasNoMore(value: boolean): void;
}

/** Snapshot API (used by persist, but safe to expose) */
export interface EntityCollectionSnapshotAPI<Id = string | number> {
  getSnapshot(): EntityCollectionSnapshot<Id>;
  applySnapshot(snapshot: EntityCollectionSnapshot<Id>): void;
}

/** Final public type */
export type EntityCollection<
  T = any,
  M = any,
  Id = string | number,
> = EntityCollectionView<Id, M> &
  EntityCollectionActions<T, Id> &
  EntityCollectionSnapshotAPI<Id>;

export type MultiEntityCollection<T, M> = Record<
  string,
  EntityCollection<T, M>
> & {
  readonly base: EntityCollection<T, M>;
  reset(): void;
};
