import type { StoresSnapshot } from '../types';
import type { CoreStoresAPI } from './types';

export function createStoresAPI<TStores extends Record<string, any>>(
  stores: TStores | any = {},
): CoreStoresAPI<TStores> {
  return {
    getSnapshot(): StoresSnapshot<TStores> {
      const out = {} as StoresSnapshot<TStores>;

      (Object.keys(stores) as Array<keyof TStores>).forEach(key => {
        out[key] = stores[key]?.__getSnapshot?.();
      });

      return out;
    },

    getSnapshotByKey<K extends keyof TStores>(
      key: K,
    ): StoresSnapshot<TStores>[K] {
      return stores[key]?.__getSnapshot?.();
    },

    applySnapshot(snapshot: StoresSnapshot<TStores>): void {
      (Object.keys(snapshot) as Array<keyof TStores>).forEach(key => {
        stores[key]?.__applySnapshot?.(snapshot[key]);
      });
    },

    applySnapshotByKey<K extends keyof TStores>(
      key: K,
      snap: StoresSnapshot<TStores>[K],
    ): void {
      stores[key]?.__applySnapshot?.(snap);
    },

    resetAll(): void {
      Object.values(stores).forEach(store => {
        (store as any)?.resetStore?.();
      });
    },

    resetByKey<K extends keyof TStores>(key: K): void {
      stores[key]?.resetStore?.();
    },
  };
}
