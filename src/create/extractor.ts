import { runInAction } from 'mobx';

import { type StoreShape } from './scanner';

import type { Scanner } from './scanner';

export class StoreSnapshotExtractor {
  constructor(private scanner: Scanner) {}

  getSnapshot(store: any, shape: StoreShape) {
    const out: Record<string, any> = {};

    // plain
    for (const key of Object.keys(shape.plain)) {
      out[key] = store[key];
    }

    // single collections
    for (const key of shape.single) {
      out[key] = store[key]?.getSnapshot?.();
    }

    // multi collections
    for (const key of shape.multi) {
      const mc = store[key];
      if (mc?.getMultiSnapshot) {
        out[key] = mc.getMultiSnapshot();
      }
    }

    // records
    for (const key of shape.records) {
      out[key] = store[key]?.getSnapshot?.();
    }

    return out;
  }

  applySnapshot(store: any, snap: any, shape: StoreShape) {
    if (!snap) {
      return;
    }

    runInAction(() => {
      // plain
      for (const key of Object.keys(shape.plain)) {
        if (key in snap) {
          try {
            store[key] = snap[key];
          } catch {}
        }
      }

      // single
      for (const key of shape.single) {
        if (snap[key]) {
          store[key]?.applySnapshot?.(snap[key], { silent: true });
        }
      }

      // multi
      for (const key of shape.multi) {
        if (snap[key]) {
          store[key]?.applyMultiSnapshot?.(snap[key]);
        }
      }

      // records
      for (const key of shape.records) {
        if (snap[key]) {
          store[key]?.applySnapshot?.(snap[key]);
        }
      }
    });
  }
}
