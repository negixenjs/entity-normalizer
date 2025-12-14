// @ts-nocheck
import { EntityCollection } from '../entity-collection';
import { MultiEntityCollection } from '../multi-entity-collection';

// ---------- MOCKS ----------
class MockEntitiesStore {
  map = new Map();
  mergeEntity(key, dto, id) {
    this.map.set(`${key}:${id}`, dto);
  }
  getEntity(key, id) {
    return this.map.get(`${key}:${id}`);
  }
}

class MockEntitiesCleaner {
  deleteCascade = jest.fn();
  resetEntity = jest.fn();
}

class MockPersist {
  pointers = 0;
  notifyPointersChanged = jest.fn(() => {
    this.pointers++;
  });
}

class MockEntitiesApi {
  process = jest.fn(({ data }) => data.map(item => item.id));
}

// SystemDeps mock
class MockSystem {
  entities = new MockEntitiesStore();
  entitiesCleaner = new MockEntitiesCleaner();
  persist = new MockPersist();
  entitiesApi = new MockEntitiesApi();

  notify = () => {
    this.persist.notifyPointersChanged();
  };
}

// ------------------------------------------------------------

describe('MultiEntityCollection', () => {
  let system;
  let multi;

  beforeEach(() => {
    system = new MockSystem();

    multi = new MultiEntityCollection(
      {
        entityKey: 'post',
        collectionId: 'main',
        limit: 10,
      },
      system,
    );
  });

  test('ensureGroup() creates group once and returns same instance', () => {
    const g1 = multi.ensureGroup('popular');
    const g2 = multi.ensureGroup('popular');

    expect(g1).toBe(g2);
    expect(g1).toBeInstanceOf(EntityCollection);
  });

  test('getProxy auto-creates group on missing key access', () => {
    const proxy = multi.getProxy();

    proxy.popular.append([{ id: 1 }]);

    expect(proxy.popular.asArray).toEqual([1]);
    expect(multi.getSubCollections().has('popular')).toBe(true);
  });

  test('applyMultiSnapshot creates groups and applies snapshots', () => {
    multi.applyMultiSnapshot({
      recent: { items: [1, 2], hasNoMore: false, reversed: false, limit: 10 },
      starred: { items: [9], hasNoMore: true, reversed: false, limit: 10 },
    });

    expect(system.persist.pointers).toBe(1);
  });

  test('getMultiSnapshot returns only registered groups', () => {
    const g = multi.ensureGroup('alpha');
    g.set([{ id: 100 }]);

    expect(multi.getMultiSnapshot()).toEqual({
      alpha: {
        items: [100],
        hasNoMore: true,
        reversed: false,
        limit: 10,
      },
    });
  });

  test('resetAll resets all groups', () => {
    const a = multi.ensureGroup('a');
    const b = multi.ensureGroup('b');

    a.set([{ id: 1 }]);
    b.set([{ id: 2 }]);

    multi.resetAll();

    expect(a.asArray).toEqual([]);
    expect(b.asArray).toEqual([]);
    expect(system.persist.pointers).toBe(3);
  });
});
