import { StoreManager } from './manager';

import type { DomainDeps, StoreDepsCombined } from '../root/types';


export function createStore<TStore>(
  StoreClass: new (deps: DomainDeps) => TStore,
  deps: StoreDepsCombined,
): TStore {
  return new StoreManager(deps).create(StoreClass);
}
