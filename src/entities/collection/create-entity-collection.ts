import { EntityCollection } from './entity-collection';
import { MultiEntityCollection as ProxyEntityCollection } from './multi-entity-collection';

import type { MultiEntityCollection } from './public';
import type { EntityCollectionOptions, SystemDeps } from './types';

export function createEntityCollection<T extends { id: string | number }, M>(
  options: EntityCollectionOptions<T>,
  system: SystemDeps,
): EntityCollection<T, M> {
  return new EntityCollection<T, M>(options, system);
}

export function createMultiEntityCollection<
  T extends { id: string | number },
  M,
>(
  options: EntityCollectionOptions<T>,
  system: SystemDeps,
): MultiEntityCollection<T, M> {
  return new ProxyEntityCollection<T, M>(options, system).getProxy();
}
