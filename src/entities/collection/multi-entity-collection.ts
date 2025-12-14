import { makeAutoObservable } from 'mobx';

import { EntityCollection } from './entity-collection';
import { MULTI_COLLECTION_TAG, COLLECTION_TAG } from './marker';

import type { MultiEntityCollection as PublicMultiEntityCollection } from './public';
import type {
  EntityCollectionOptions,
  EntityCollectionSnapshot,
  GroupCollection,
  MultiCollection,
  SystemDeps,
} from './types';

export class MultiEntityCollection<T extends { id: string | number }, M>
  implements MultiCollection<T, M>
{
  [COLLECTION_TAG]: true = true;
  [MULTI_COLLECTION_TAG]: true = true;

  private sub = new Map<string, GroupCollection<T, M>>();
  private registeredGroups = new Set<string>();

  base: EntityCollection<T, M>;

  constructor(
    private options: EntityCollectionOptions<T>,
    private system: SystemDeps,
  ) {
    const { collectionId, ...rest } = options;
    void collectionId;

    this.base = new EntityCollection(
      {
        ...rest,
        collectionId: `multi-base-${collectionId}`,
      },
      this.system,
    );

    makeAutoObservable<this, 'sub' | 'registeredGroups'>(this, {
      sub: false,
      registeredGroups: false,
    });
  }

  private notify() {
    this.system.notify();
  }

  ensureGroup(group: string): GroupCollection<T, M> {
    if (!group || group.startsWith('Symbol(') || group.startsWith('__')) {
      return this.base;
    }

    if (!this.sub.has(group)) {
      const { collectionId, ...rest } = this.options;

      this.sub.set(
        group,
        new EntityCollection<T, M>(
          {
            ...rest,
            collectionId: `multi-${group}-${collectionId}`,
          },
          this.system,
        ),
      );

      this.registeredGroups.add(group);
    }

    return this.sub.get(group)!;
  }

  getSubCollections(): Map<string, GroupCollection<T, M>> {
    return this.sub;
  }

  getMultiSnapshot(): Record<string, EntityCollectionSnapshot> {
    const out: Record<string, EntityCollectionSnapshot> = {};

    for (const group of this.registeredGroups) {
      if (group.startsWith('Symbol(') || group.startsWith('__')) {
        continue;
      }

      const col = this.sub.get(group);
      if (col) {
        out[group] = col.getSnapshot();
      }
    }

    return out;
  }

  applyMultiSnapshot(snap: Record<string, EntityCollectionSnapshot>) {
    for (const [groupKey, groupSnap] of Object.entries(snap)) {
      this.ensureGroup(groupKey).applySnapshot(groupSnap, { silent: true });
    }

    this.notify();
  }

  resetAll() {
    for (const col of this.sub.values()) {
      col.reset({ silent: true });
    }
    this.notify();
  }

  reset() {
    this.resetAll();
  }

  getProxy(): PublicMultiEntityCollection<T, M> {
    const self = this;

    return new Proxy({} as PublicMultiEntityCollection<T, M>, {
      get(_target, prop: string | symbol) {
        if (typeof prop !== 'string') {
          return (self as any)[prop];
        }

        if (prop === 'base') {
          return self.base;
        }
        if (prop === 'reset') {
          return self.reset.bind(self);
        }

        // allow reading native props if needed
        if (prop in self) {
          return (self as any)[prop];
        }

        return self.ensureGroup(prop);
      },
    });
  }
}
