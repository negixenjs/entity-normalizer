import type { TEntitiesStore } from '../types';
import type { SchemaWalker } from './walker';

export class BucketCollector {
  constructor(
    private entities: TEntitiesStore,
    private walker: SchemaWalker,
  ) {}

  collect(entityKey: string, id: string | number) {
    const visited = new Set<string>();
    const bucket: Record<string, Set<string>> = {} as any;

    const walk = (key: string, entityId: string | number) => {
      const visitKey = `${key}:${entityId}`;
      if (visited.has(visitKey)) {
        return;
      }
      visited.add(visitKey);

      const entity = this.entities.getEntity(key, entityId);

      if (!entity) {
        return;
      }

      if (!bucket[key]) {
        bucket[key] = new Set();
      }
      bucket[key]!.add(String(entityId));

      this.walker.walkFields(key, entity, (childKey, childId) => {
        walk(childKey, childId);
      });
    };

    walk(entityKey, id);

    return bucket;
  }
}
