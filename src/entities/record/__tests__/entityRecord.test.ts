// @ts-nocheck
import { EntityRecord } from '../entity-record';

// ---------- MOCKS ----------

class MockEntitiesStore {
  map = new Map();

  mergeEntity(entityKey, dto, id) {
    this.map.set(`${entityKey}:${id}`, dto);
  }

  getEntity(entityKey, id) {
    return this.map.get(`${entityKey}:${id}`);
  }
}

class MockEntitiesCleaner {
  calls = [];
  deleteCascade = (...args) => {
    this.calls.push(args);
  };
}

class MockEntitiesApi {
  constructor(private entities: MockEntitiesStore) {}

  process = jest.fn(({ data, entityKey }) => {
    const ids = data.map(x => x.id);
    ids.forEach((id, idx) => {
      this.entities.mergeEntity(entityKey, data[idx], id);
    });
    return ids;
  });
}

class MockRoot {
  constructor() {
    this.entities = new MockEntitiesStore();
    this.entitiesCleaner = new MockEntitiesCleaner();
    this.entitiesApi = new MockEntitiesApi(this.entities);
    this.notify = jest.fn();
  }
}

// helper to create EntityRecord with new API
function createRecord(entityKey, recordId, root) {
  return new EntityRecord(
    { entityKey, recordId },
    {
      entities: root.entities,
      entitiesCleaner: root.entitiesCleaner,
      notify: root.notify,
      entitiesApi: root.entitiesApi,
    },
  );
}

async function flushMicrotasks(times = 2) {
  for (let i = 0; i < times; i++) {
    await Promise.resolve();
  }
}

// ------------------------------------------------------------

describe('EntityRecord', () => {
  let root;
  let record;

  beforeEach(() => {
    root = new MockRoot();
    record = createRecord('post', 'record-1', root);
  });

  test('initial state', () => {
    expect(record.entityId).toBeNull();
    expect(record.data).toBeUndefined();
    expect(record.exists).toBe(false);
    expect(record.isEmpty).toBe(true);
  });

  test('set() normalizes via entitiesApi.process, stores id, notify once', () => {
    record.set({ id: 10, title: 'A' });

    expect(root.entitiesApi.process).toHaveBeenCalledTimes(1);
    expect(root.entitiesApi.process).toHaveBeenCalledWith({
      data: [{ id: 10, title: 'A' }],
      entityKey: 'post',
      sourceRefId: 'record-1',
    });

    expect(record.entityId).toBe(10);
    expect(root.entities.getEntity('post', 10)).toEqual({ id: 10, title: 'A' });

    expect(root.notify).toHaveBeenCalledTimes(1);
  });

  test('update() normalizes, does not change id, notify invoked', () => {
    record.set({ id: 10, title: 'A' });
    root.notify.mockClear();

    record.update({ id: 10, title: 'B' });

    expect(root.entities.getEntity('post', 10)).toEqual({ id: 10, title: 'B' });
    expect(record.entityId).toBe(10);

    expect(root.notify).toHaveBeenCalledTimes(1);
  });

  test('update() when empty does not set id (current behavior), notify invoked', () => {
    record.update({ id: 77, x: 1 });

    // update() calls process but does not assign this.id
    expect(record.entityId).toBeNull();
    expect(root.entities.getEntity('post', 77)).toEqual({ id: 77, x: 1 });

    expect(root.notify).toHaveBeenCalledTimes(1);
  });

  test('reset() clears id and cascades delete + notify', () => {
    record.set({ id: 5 });
    root.notify.mockClear();

    record.reset();

    expect(record.entityId).toBeNull();
    expect(root.entitiesCleaner.calls.length).toBe(1);

    const [entityKey, ids, sourceRefId] = root.entitiesCleaner.calls[0];
    expect(entityKey).toBe('post');
    expect(ids).toEqual([5]);
    expect(String(sourceRefId)).toContain('record-1');

    expect(root.notify).toHaveBeenCalledTimes(1);
  });

  test('reset() when empty does nothing (no cascade, no notify)', () => {
    record.reset();
    expect(root.notify).not.toHaveBeenCalled();
    expect(root.entitiesCleaner.calls).toEqual([]);
  });

  test('data getter returns the entity', () => {
    record.set({ id: 1, x: 100 });
    expect(record.data).toEqual({ id: 1, x: 100 });
  });

  test('data getter lazy-cleans missing entity (async) and notifies', async () => {
    record.set({ id: 7 });
    root.notify.mockClear();

    root.entities.map.delete('post:7');

    const res = record.data;
    expect(res).toBeUndefined();

    // lazy cleanup scheduled
    expect(record.entityId).toBe(7);

    await flushMicrotasks();

    expect(record.entityId).toBeNull();
    expect(root.notify).toHaveBeenCalledTimes(1);
  });

  test('exists returns correct boolean', async () => {
    expect(record.exists).toBe(false);

    record.set({ id: 1 });
    expect(record.exists).toBe(true);

    root.entities.map.delete('post:1');
    // accessing exists triggers data getter which schedules lazy cleanup
    expect(record.exists).toBe(false);

    await flushMicrotasks();
    expect(record.entityId).toBeNull();
  });

  test('isEmpty works correctly', () => {
    expect(record.isEmpty).toBe(true);
    record.set({ id: 1 });
    expect(record.isEmpty).toBe(false);
  });

  test('snapshot → applySnapshot restores state and notifies', () => {
    record.set({ id: 11 });

    const snap = record.getSnapshot();
    expect(snap).toEqual({ id: 11 });

    root.notify.mockClear();

    record.applySnapshot({ id: 99 });

    expect(record.entityId).toBe(99);
    expect(root.notify).toHaveBeenCalledTimes(1);
  });

  test('applySnapshot() sets null and notifies', () => {
    record.set({ id: 1 });
    root.notify.mockClear();

    record.applySnapshot({ id: null });

    expect(record.entityId).toBeNull();
    expect(root.notify).toHaveBeenCalledTimes(1);
  });

  test('process() stores entity in entities store', () => {
    record.set({ id: 123, value: 10 });

    expect(root.entities.getEntity('post', 123)).toEqual({
      id: 123,
      value: 10,
    });
  });

  test('edge: id=0 treated as empty in data getter (current behavior)', async () => {
    record.set({ id: 0, v: 1 });

    // data getter: if (!this.id) return undefined; (0 is falsy)
    expect(record.data).toBeUndefined();
    expect(record.entityId).toBe(0);

    await flushMicrotasks();
    expect(record.entityId).toBe(0);
  });

  test('entitiesApi.process called with correct sourceRefId every time', () => {
    record.set({ id: 1 });
    record.update({ id: 1, x: 2 });
    record.update({ id: 2, y: 3 });

    const calls = root.entitiesApi.process.mock.calls.map(args => args[0]);
    expect(calls.every(c => c.sourceRefId === 'record-1')).toBe(true);
    expect(calls.every(c => c.entityKey === 'post')).toBe(true);
  });

  test('resolve() switches pointer from tempId to realId', () => {
    record.set({ id: 'tmp-1', title: 'Optimistic' });
    root.notify.mockClear();

    record.resolve('tmp-1', { id: 'real-1', title: 'Real' });

    expect(record.entityId).toBe('real-1');
    expect(root.entities.getEntity('post', 'real-1')).toEqual({
      id: 'real-1',
      title: 'Real',
    });

    expect(root.notify).toHaveBeenCalledTimes(1);
  });

  test('resolve() schedules temp entity for cleanup', () => {
    record.set({ id: 'tmp-1' });

    record.resolve('tmp-1', { id: 'real-1' });

    expect(root.entitiesCleaner.calls).toEqual([
      ['post', ['tmp-1'], expect.stringContaining('record-1')],
    ]);
  });

  test('resolve() does nothing if record is not pointing to tempId', () => {
    record.set({ id: 'other' });
    const p = root.notify.mock.calls.length;

    record.resolve('tmp-1', { id: 'real-1' });

    expect(record.entityId).toBe('other');
    expect(root.notify.mock.calls.length).toBe(p);
    expect(root.entitiesCleaner.calls).toEqual([]);
  });

  test('resolve() works with numeric ids', () => {
    record.set({ id: 999 });

    record.resolve(999, { id: 1 });

    expect(record.entityId).toBe(1);
    expect(root.entities.getEntity('post', 1)).toEqual({ id: 1 });
  });
});
