import { runInAction } from 'mobx';

import type { StoreShape } from './scanner';
import type { SystemDeps } from '../root/types';


const SUPPRESS_KEY = '__suppressPersistNotify';

function incSuppress(store: any) {
  store[SUPPRESS_KEY] = (store[SUPPRESS_KEY] ?? 0) + 1;
}
function decSuppress(store: any) {
  store[SUPPRESS_KEY] = Math.max(0, (store[SUPPRESS_KEY] ?? 0) - 1);
}

export class Cleaner {
  constructor(private deps: SystemDeps) { }

  applyReset(
    store: any,
    shape: Pick<StoreShape, 'plain' | 'single' | 'multi' | 'records'>,
  ) {
    const initialPlain = shape.plain;

    if (typeof store.resetStore === 'function') {
      return;
    }

    Object.defineProperty(store, 'resetStore', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: () => {
        incSuppress(store);

        runInAction(() => {
          // plain fields
          for (const [key, val] of Object.entries(initialPlain)) {
            try {
              store[key] = val;
            } catch { }
          }

          // single collections
          for (const key of shape.single) {
            try {
              store[key].reset?.();
            } catch { }
          }

          // multi collections
          for (const key of shape.multi) {
            const mc = store[key];
            try {
              if (mc?.resetAll) {
                mc.resetAll();
              } else if (mc?.getSubCollections) {
                for (const col of mc.getSubCollections().values()) {
                  col.reset?.({ silent: true });
                }
              }
            } catch { }
          }

          // records
          for (const key of shape.records) {
            try {
              store[key].reset?.();
            } catch { }
          }
        });

        decSuppress(store);

        // 1 notify, async
        queueMicrotask(() =>
          this.deps?.getPersistence?.()?.onStoreStateChanged?.(),
        );
      },
    });
  }
}
