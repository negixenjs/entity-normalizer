// @ts-nocheck
import { EntityCollection } from '../entity-collection';

// ----------- MOCKS -----------

class MockEntitiesStore {
  map = new Map();

  getEntity(key, id) {
    return this.map.get(`${key}:${id}`);
  }

  mergeEntity(key, dto, id) {
    this.map.set(`${key}:${id}`, dto);
  }
}

class MockEntitiesCleaner {
  calls = [];
  deleteCascade = (...args) => {
    this.calls.push(args);
  };
}

class MockPersist {
  pointers = 0;
  notifyPointersChanged = jest.fn(() => {
    this.pointers++;
  });
}

function createSchema({
  idKey = 'id',
  getId = (x: any) => x?.[idKey] ?? x?.id ?? x?.slug ?? x?.uuid,
} = {}) {
  return {
    getIdKey: () => idKey,
    getId,
  };
}

class MockEntitiesApi {
  constructor(private entities: MockEntitiesStore) {}

  schemas = {
    post: createSchema({
      idKey: 'slug',
      getId: (x: any) => x?.slug ?? x?.id,
    }),
    default: createSchema({ idKey: 'id' }),
  };

  getSchema = jest.fn(
    (entityKey: string) => this.schemas[entityKey] ?? this.schemas.default,
  );

  process = jest.fn(({ data, entityKey }) => {
    const schema = this.getSchema(entityKey);
    const ids = data.map((item: any) => schema.getId(item));

    ids.forEach((id: any, i: number) => {
      this.entities.mergeEntity(entityKey, data[i], id);
    });

    return ids;
  });
}

class MockSystem {
  entities = new MockEntitiesStore();
  entitiesCleaner = new MockEntitiesCleaner();
  persist = new MockPersist();
  entitiesApi = new MockEntitiesApi(this.entities);
}

// ----------- HELPERS -----------

function createCollection(opts, system: MockSystem) {
  return new EntityCollection(opts, {
    entities: system.entities,
    entitiesCleaner: system.entitiesCleaner,
    notify: system.persist.notifyPointersChanged,
    entitiesApi: system.entitiesApi,
  });
}

async function flushMicrotasks(times = 2) {
  for (let i = 0; i < times; i++) {
    await Promise.resolve();
  }
}

// ----------- TESTS -----------

describe('EntityCollection', () => {
  let system: MockSystem;
  let c: EntityCollection<any, any>;

  beforeEach(() => {
    system = new MockSystem();
    c = createCollection(
      {
        entityKey: 'post',
        collectionId: 'col-1',
        limit: 3,
      },
      system,
    );
  });

  test('initial state', () => {
    expect(c.count).toBe(0);
    expect(c.isEmpty).toBe(true);
    expect(c.hasNoMore).toBe(false);
    expect(c.asArray).toEqual([]);
    expect(c.first).toBeUndefined();
    expect(c.last).toBeUndefined();
    expect(c.pageNumber).toBe(1);
  });

  test('process contract', () => {
    c.set([{ id: 1 }]);

    expect(system.entitiesApi.process).toHaveBeenCalledWith({
      data: [{ id: 1 }],
      entityKey: 'post',
      sourceRefId: 'col-1',
      isCollection: true,
    });
  });

  test('idAttribute from schema', () => {
    expect(c.idAttribute).toBe('slug');
  });

  test('set()', () => {
    c.set([{ id: 1 }, { id: 2 }, { id: 3 }]);

    expect(c.asArray).toEqual([1, 2, 3]);
    expect(c.hasNoMore).toBe(false);
    expect(system.persist.pointers).toBe(1);
  });

  test('set < limit → hasNoMore', () => {
    c.set([{ id: 1 }]);
    expect(c.hasNoMore).toBe(true);
  });

  test('append()', () => {
    c.set([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const p = system.persist.pointers;

    c.append([{ id: 4 }]);

    expect(c.asArray).toEqual([1, 2, 3, 4]);
    expect(system.persist.pointers).toBe(p + 1);
    expect(c.hasNoMore).toBe(true);
  });

  test('prepend()', () => {
    c.set([{ id: 2 }, { id: 3 }]);
    const p = system.persist.pointers;

    c.prepend([{ id: 1 }]);

    expect(c.asArray).toEqual([1, 2, 3]);
    expect(system.persist.pointers).toBe(p + 1);
  });

  test('add normal', () => {
    c.set([{ id: 2 }]);
    c.add({ id: 1 });

    expect(c.asArray).toEqual([1, 2]);
  });

  test('reversed set', () => {
    c = createCollection(
      { entityKey: 'post', reversed: true, collectionId: 'rev', limit: 10 },
      system,
    );

    c.set([{ id: 1 }, { id: 2 }]);
    expect(c.asArray).toEqual([2, 1]);
  });

  test('updateItem does not change order', () => {
    c.set([{ id: 1 }]);
    c.updateItem({ id: 1, x: 10 });

    expect(c.asArray).toEqual([1]);
    expect(system.entities.getEntity('post', 1)).toEqual({ id: 1, x: 10 });
  });

  test('findById', () => {
    c.set([{ id: 1 }]);
    expect(c.findById(1)).toEqual({ id: 1 });
    expect(c.findById(undefined)).toBeUndefined();
  });

  test('findById(0) → undefined (by design)', () => {
    c.set([{ id: 0 }]);
    expect(c.findById(0)).toBeUndefined();
  });

  test('removeById', () => {
    c.set([{ id: 1 }, { id: 2 }]);
    const p = system.persist.pointers;

    c.removeById(1);

    expect(c.asArray).toEqual([2]);
    expect(system.persist.pointers).toBe(p + 1);
  });

  test('removeIds empty → no-op', () => {
    c.set([{ id: 1 }]);
    const p = system.persist.pointers;

    c.removeIds([]);

    expect(system.persist.pointers).toBe(p);
  });

  test('reset()', () => {
    c.set([{ id: 1 }, { id: 2 }]);
    const p = system.persist.pointers;

    c.reset();

    expect(c.asArray).toEqual([]);
    expect(system.persist.pointers).toBe(p + 1);
  });

  test('getList lazy cleanup', async () => {
    c.set([{ id: 1 }, { id: 2 }]);
    system.entities.map.delete('post:2');

    const list = c.getList;
    expect(list).toEqual([{ id: 1 }]);

    await flushMicrotasks();

    expect(c.asArray).toEqual([1]);
  });

  test('snapshot', () => {
    c.set([{ id: 1 }]);

    expect(c.getSnapshot()).toEqual({
      items: [1],
      hasNoMore: true,
      reversed: false,
      limit: 3,
    });
  });

  test('applySnapshot silent', () => {
    const p = system.persist.pointers;

    c.applySnapshot(
      { items: [5], hasNoMore: false, reversed: false, limit: 3 },
      { silent: true },
    );

    expect(system.persist.pointers).toBe(p);
  });

  test('pageNumber / offset', () => {
    c.set([{ id: 1 }, { id: 2 }, { id: 3 }]);

    expect(c.pageNumber).toBe(2);
    expect(c.offset).toBe(3);

    c.append([{ id: 4 }]);

    expect(c.pageNumber).toBe(2);
    expect(c.offset).toBe(4);
  });

  describe('resolveById()', () => {
    test('replaces temp id with real id in the same position', () => {
      c.set([{ id: 'a' }, { id: 'tmp-1' }, { id: 'b' }]);
      const p = system.persist.pointers;

      c.resolveById('tmp-1', { id: 'real-1', title: 'Real' });

      expect(c.asArray).toEqual(['a', 'real-1', 'b']);
      expect(system.persist.pointers).toBe(p + 1);
    });

    test('upserts real entity and removes temp entity', () => {
      c.set([{ id: 'tmp-1' }]);

      c.resolveById('tmp-1', { id: 'real-1', title: 'Real post' });

      // real entity exists
      expect(system.entities.getEntity('post', 'real-1')).toEqual({
        id: 'real-1',
        title: 'Real post',
      });

      // temp entity removed via cleaner
      expect(system.entitiesCleaner.calls).toEqual([
        ['post', ['tmp-1'], 'collection:col-1'],
      ]);
    });

    test('keeps order for multiple items', () => {
      c.set([{ id: 'tmp-1' }, { id: 'x' }, { id: 'y' }]);

      c.resolveById('tmp-1', { id: 'real-1' });

      expect(c.asArray).toEqual(['real-1', 'x', 'y']);
    });

    test('does nothing if tempId is not found', () => {
      c.set([{ id: 'a' }, { id: 'b' }]);
      const snapshot = c.asArray.slice();
      const p = system.persist.pointers;

      c.resolveById('missing', { id: 'real-x' });

      expect(c.asArray).toEqual(snapshot);
      expect(system.persist.pointers).toBe(p);
      expect(system.entitiesCleaner.calls).toEqual([]);
    });

    test('works with non-string ids', () => {
      c.set([{ id: 1 }, { id: 999 }]);

      c.resolveById(999, { id: 42 });

      expect(c.asArray).toEqual([1, 42]);
      expect(system.entities.getEntity('post', 42)).toEqual({ id: 42 });
    });
  });
});
