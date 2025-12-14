import { makeAutoObservable } from 'mobx';

import { createStore } from '../create';
import { EntityCleanerStore } from '../entities/cleaner';
import {
  COLLECTION_TAG,
  MULTI_COLLECTION_TAG,
} from '../entities/collection/marker';
import { RECORD_TAG } from '../entities/record/marker';
import { EntitiesStore } from '../entities/store';
import { createCoreAPI } from './coreApi/create-core-api';
import { noopPersistence } from './fallback';
import { SET_PERSISTENCE } from './marker';

import type { CoreAPI } from './coreApi/types';
import type {
  RootStoreDeps,
  SystemDeps,
  StoreDepsCombined,
  StoreClassMap,
  ServiceClassMap,
  PersistenceNotifier,
} from './types';
import type { AnySchema, TEntitiesStore } from '../entities/types';

export class RootStore<
  TApi,
  TSchemaMap extends Record<string, AnySchema>,
  TStores extends StoreClassMap<any, any>,
  TServices extends ServiceClassMap<any, any>,
> {
  public core!: CoreAPI<{
    [K in keyof TStores]: InstanceType<TStores[K]>;
  }>;

  private entities: TEntitiesStore;
  private entitiesCleaner: EntityCleanerStore;
  private persistence?: PersistenceNotifier;

  [SET_PERSISTENCE](notifier: PersistenceNotifier) {
    this.persistence = notifier;
  }

  public stores!: { [K in keyof TStores]: InstanceType<TStores[K]> };
  public services!: { [K in keyof TServices]: InstanceType<TServices[K]> };

  private _isInitialized = false;

  constructor(
    private deps: RootStoreDeps<TApi, TSchemaMap, TStores, TServices>,
  ) {
    const self = this;

    // ---------------------------------------------
    // Core systems
    // ---------------------------------------------
    this.entities = new EntitiesStore() as TEntitiesStore;
    this.entitiesCleaner = new EntityCleanerStore(
      this.entities,
      this.deps.schemaMap,
    );

    const storesRef = {} as {
      [K in keyof TStores]: InstanceType<TStores[K]>;
    };

    this.core = createCoreAPI({
      lifecycle: {
        getIsInitialized: () => self.isInitialized,
        setInitialized: (v: boolean) => self.setInitialized(v),
      },
      entities: {
        entities: this.entities,
        entitiesCleaner: this.entitiesCleaner,
        schemaMap: this.deps.schemaMap,
        getPersistence: () => this.persistence ?? noopPersistence,
      },
      stores: storesRef,
      __internal: {
        setPersistence: notifier => {
          this[SET_PERSISTENCE](notifier);
        },
      },
    });

    // ---------------------------------------------
    // Deps
    // ---------------------------------------------
    const domainDeps = {
      api: deps.api,
      get stores() {
        return self.stores;
      },
      get services() {
        return self.services;
      },
      core: this.core,
    };

    const systemDeps: SystemDeps = {
      getPersistence: () => this.persistence ?? noopPersistence,
      entities: this.entities,
    };

    const combinedDeps: StoreDepsCombined = {
      domain: domainDeps,
      system: systemDeps,
    };

    // ---------------------------------------------
    // Plugins
    // ---------------------------------------------

    const decorators = {
      isRecord: (v: any) => v?.[RECORD_TAG] === true,
      isCollection: (v: any) => v?.[COLLECTION_TAG] === true,
      isMultiCollection: (v: any) => v?.[MULTI_COLLECTION_TAG] === true,
    };

    for (const plugin of this.deps.plugins ?? []) {
      plugin.setup({
        entities: this.entities,
        core: this.core,
        config: plugin.config,
        domain: domainDeps,
        decorators,
      });
    }

    // ---------------------------------------------
    // Build stores
    // ---------------------------------------------
    this.stores = Object.fromEntries(
      Object.entries(this.deps.stores).map(([key, StoreClass]) => {
        const instance = createStore(StoreClass as any, combinedDeps);
        return [key, instance];
      }),
    ) as any;

    Object.assign(storesRef, this.stores);

    // ---------------------------------------------
    // Build services
    // ---------------------------------------------
    this.services = Object.fromEntries(
      Object.entries(this.deps.services).map(([key, ServiceClass]) => {
        const instance = new (ServiceClass as any)(domainDeps);

        Object.defineProperty(instance, 'deps', {
          enumerable: false,
          configurable: true,
          writable: true,
        });

        return [key, instance];
      }),
    ) as any;

    // Hide cyclical getters inside domainDeps

    Object.defineProperty(this, 'deps', {
      enumerable: false,
      configurable: true,
      writable: true,
    });

    Object.defineProperty(domainDeps, 'stores', {
      enumerable: false,
      configurable: true,
    });

    Object.defineProperty(domainDeps, 'services', {
      enumerable: false,
      configurable: true,
    });

    Object.defineProperty(domainDeps, 'core', {
      enumerable: false,
      configurable: true,
    });

    Object.defineProperty(this.core, '__internal', {
      enumerable: false,
    });

    makeAutoObservable(this, {
      core: false,
      services: false,
      stores: false,
    });
  }

  private get isInitialized() {
    return this._isInitialized;
  }

  private setInitialized(v: boolean) {
    this._isInitialized = v;
  }
}
