import { runInAction } from 'mobx';

import type { SystemDeps } from '../root/types';

const SUPPRESS_KEY = '__suppressPersistNotify';

export class StoreProxy {
  private notifyQueued = false;

  constructor(
    private deps: SystemDeps,
    private target: any,
    private actions: string[],
  ) {}

  build() {
    return new Proxy(this.target, {
      get: (target, prop, receiver) => {
        const value = Reflect.get(target, prop, receiver);

        if (!this.actions.includes(prop as string)) {
          return value;
        }

        // allow duck/collection objects to pass-through (no wrapping)
        if (value && typeof value === 'object') {
          return value;
        }

        if (typeof value === 'function') {
          return this.wrapAction(target, value);
        }

        return value;
      },

      set: (target, prop, val, receiver) => {
        const result = Reflect.set(target, prop, val, receiver);
        this.scheduleNotify(target);
        return result;
      },
    });
  }

  private scheduleNotify(target: any) {
    if ((target?.[SUPPRESS_KEY] ?? 0) > 0) {
      return;
    }

    if (this.notifyQueued) {
      return;
    }
    this.notifyQueued = true;

    queueMicrotask(() => {
      this.notifyQueued = false;
      this.deps.getPersistence?.()?.onStoreStateChanged?.();
    });
  }

  private wrapAction(target: any, fn: Function) {
    return (...args: any[]) => {
      const result = runInAction(() => fn.apply(target, args));

      if (result instanceof Promise) {
        return result.finally(() => this.scheduleNotify(target));
      }

      this.scheduleNotify(target);
      return result;
    };
  }
}
