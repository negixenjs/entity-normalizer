import type { CreateRootStoreConfig } from './public';
import { RootStore } from './RootStore';

export function createRootStore<
  TApi,
  TSchemas extends Record<string, any>,
  TStores extends Record<string, any>,
  TServices extends Record<string, any>,
>(config: CreateRootStoreConfig<TApi, TSchemas, TStores, TServices>) {
  return new RootStore({
    api: config.api,
    schemaMap: config.schemaMap,
    stores: config.stores,
    services: config.services,
    plugins: config.plugins ?? [],
  });
}
