import type { PublicEntitySchema } from '../entities/public';
import type { CoreAPI } from './coreApi/types';

export type PublicSchemaMap = Record<string, PublicEntitySchema<any, any>>;
export type PublicStoreMap = Record<string, new (...args: any[]) => any>;
export type PublicServiceMap = Record<string, new (...args: any[]) => any>;

export interface CreateRootStoreConfig<
  TApi,
  TSchemas extends PublicSchemaMap,
  TStores extends PublicStoreMap,
  TServices extends PublicServiceMap,
> {
  api: TApi;

  schemaMap: TSchemas;

  stores: TStores;
  services: TServices;

  plugins?: any[];
}

/**
 * PUBLIC deps passed into Stores / Services
 *
 * Used like:
 *   constructor(deps: StoreDeps<{ stores: {...}, api: Api }>)
 */
export type StoreDeps<
  C extends {
    stores?: any;
    api?: any;
    services?: any;
  },
> = {
  api: C['api'] extends undefined ? unknown : C['api'];
  stores: C['stores'] extends undefined ? {} : C['stores'];
  services: C['services'] extends undefined ? {} : C['services'];
  core: CoreAPI<any>;
};
