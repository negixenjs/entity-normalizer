import type { RootStore } from '../root/root-store';

/**
 * Internal storage for the global RootStore reference.
 * At runtime this will hold the actual app RootStore instance.
 */
let _rootStore: RootStore<any, any, any, any> | null = null;

/**
 * Registers the RootStore instance for global DI access.
 * Should be called exactly once from the application entry point.
 */
export function registerRootStore<TStore extends RootStore<any, any, any, any>>(
  store: TStore,
): void {
  _rootStore = store;
}

/**
 * Returns the initialized RootStore instance.
 * Throws if registerRootStore() has not been called yet.
 */
export function getRootStore<
  TStore extends RootStore<any, any, any, any> = RootStore<any, any, any, any>,
>(): TStore {
  if (!_rootStore) {
    throw new Error(
      '[core/di] RootStore is not initialized. Call registerRootStore(rootStore) first.',
    );
  }

  return _rootStore as TStore;
}
