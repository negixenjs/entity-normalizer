import type { AnySchema, TEntitiesStore } from '../entities';
import type { CoreAPI } from './coreApi/types';
import type { RootStore } from './root-store';

export type DomainDeps<
  TStores = {},
  TApi = any,
  TServices = {},
  CoreAPI = {},
> = {
  api: TApi;
  stores: TStores;
  services: TServices;
  core: CoreAPI;
};

export type RootStoreInstance<
  TApi = any,
  TSchemaMap extends Record<string, AnySchema> = any,
  TStores extends StoreClassMap<any, any> = any,
  TServices extends ServiceClassMap<any, any> = any,
> = RootStore<TApi, TSchemaMap, TStores, TServices>;

// --------------------------------------------------
// SYSTEM DEPS (infra)
// --------------------------------------------------
export type SystemDeps = {
  getPersistence: () => PersistenceNotifier | undefined;
  entities: TEntitiesStore;
};

// --------------------------------------------------
// COMBINED DEPS (final deps passed into Store & Service)
// --------------------------------------------------
export type StoreDepsCombined<TStores = {}, TApi = unknown, TServices = {}> = {
  domain: DomainDeps<TStores, TApi, TServices>;
  system: SystemDeps;
};

export type StoreClass<TDeps, TInstance> = new (deps: TDeps) => TInstance;

export type StoreClassMap<TDeps, TStoreClasses> = {
  [K in keyof TStoreClasses]: StoreClass<TDeps, any>;
};

export type ServiceClassMap<TDeps, TServiceClasses> = {
  [K in keyof TServiceClasses]: new (deps: TDeps) => any;
};

export type TSchemaMap = Record<string, AnySchema>;

export type RootStoreDeps<
  TApi,
  TSchemaMap extends Record<string, AnySchema>,
  TStoreClasses extends StoreClassMap<any, any>,
  TServiceClasses extends ServiceClassMap<any, any>,
> = {
  api: TApi;
  schemaMap: TSchemaMap;
  stores: TStoreClasses;
  services: TServiceClasses;
  plugins?: RootStorePlugin[];
};

type DepsConfig = {
  api?: any;
  stores?: any;
  services?: any;
};

type NormalizeDeps<C extends DepsConfig, CoreAPI> = DomainDeps<
  C['stores'] extends undefined ? {} : C['stores'],
  C['api'] extends undefined ? any : C['api'],
  C['services'] extends undefined ? {} : C['services'],
  CoreAPI
>;

export type StoreDeps<C extends DepsConfig> = NormalizeDeps<C, CoreAPI<any>>;

export type StoreSnapshot = Record<string, any>;

export type StoresSnapshot<TStores> = {
  [K in keyof TStores]?: StoreSnapshot;
};

export type Decorators = {
  isRecord: (v: any) => boolean;
  isCollection: (v: any) => boolean;
  isMultiCollection: (v: any) => boolean;
};

export type RootStorePlugin<TConfig = unknown> = {
  name: string;
  config: TConfig;
  setup(ctx: {
    entities: any;
    core: Record<string, any>;
    config: TConfig;
    domain: DomainDeps;
    decorators: Decorators;
  }): void;
};

export type PersistenceNotifier = {
  onEntitiesChanged(): void;
  onPointersChanged(): void;
  onStoreStateChanged(): void;
};
