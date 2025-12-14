import type { PersistenceNotifier } from './types';

export const noopPersistence: PersistenceNotifier = {
  onEntitiesChanged() {},
  onPointersChanged() {},
  onStoreStateChanged() {},
};
