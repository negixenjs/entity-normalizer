import { getRootStore } from './di/register-root-store';

import type { RootStore } from './root/RootStore';

/**
 * Factory that returns typed hooks bound to a particular RootStore type.
 *
 * Usage in app:
 *   const { useStores, useServices, useCore, useStore, useService } =
 *     createHooks<typeof rootStore>();
 */
export function createStoreHooks<
  TRoot extends RootStore<any, any, any, any>,
>() {
  const useStores = (): TRoot['stores'] => getRootStore<TRoot>().stores;

  const useServices = (): TRoot['services'] => getRootStore<TRoot>().services;

  const useStore = <K extends keyof TRoot['stores']>(key: K) =>
    getRootStore<TRoot>().stores[key];

  const useService = <K extends keyof TRoot['services']>(key: K) =>
    getRootStore<TRoot>().services[key];

  const useCore = (): TRoot['core'] => getRootStore<TRoot>().core;

  return {
    useStores,
    useServices,
    useStore,
    useService,
    useCore,
  };
}
