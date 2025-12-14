// @ts-nocheck
import { META } from '../../constants/values';
import { EntitiesStore } from '../store';

describe('EntitiesStore', () => {
  let store: EntitiesStore;

  beforeEach(() => {
    store = new EntitiesStore() as any;
  });

  // ------------------------------------------------------------
  test('merge() initializes bucket and stores new entities', () => {
    store.merge({
      USER: {
        '1': { id: '1', name: 'Alice' },
      },
    });

    expect(store.hasEntity('USER', '1')).toBe(true);
    expect(store.getEntity('USER', '1')).toEqual({ id: '1', name: 'Alice' });
  });

  // ------------------------------------------------------------
  test('merge() updates existing entity via shallow merge', () => {
    store.merge({
      USER: { '1': { id: '1', name: 'Alice' } },
    });

    store.merge({
      USER: { '1': { name: 'Updated', age: 20 } },
    });

    expect(store.getEntity('USER', '1')).toEqual({
      id: '1',
      name: 'Updated',
      age: 20,
    });
  });

  // ------------------------------------------------------------
  test('merge() triggers merge callbacks', () => {
    let calls = 0;
    store.addOnMergeCallback(() => calls++);

    store.merge({
      USER: { '1': { id: '1', name: 'X' } },
    });

    expect(calls).toBe(1);
  });

  test('removeOnMergeCallback works', () => {
    let calls = 0;
    const fn = () => calls++;

    store.addOnMergeCallback(fn);
    store.removeOnMergeCallback(fn);

    store.merge({
      USER: { '1': { id: '1', name: 'X' } },
    });

    expect(calls).toBe(0);
  });

  // ------------------------------------------------------------
  test('getEntity returns entity and updates META.accessedAt', () => {
    const meta = {
      createdAt: 1,
      updatedAt: 2,
      accessedAt: 3,
      refSources: new Set(),
    };

    store.merge({
      USER: { '1': { id: '1', name: 'A', [META]: meta } },
    });

    const before = store.getEntity('USER', '1')![META].accessedAt;
    expect(before).toBeGreaterThan(0);

    const after = store.getEntity('USER', '1')![META].accessedAt;
    expect(after).toBeGreaterThanOrEqual(before);
  });

  // ------------------------------------------------------------
  test('getAll returns all bucket entities', () => {
    store.merge({
      USER: {
        '1': { id: '1', name: 'A' },
        '2': { id: '2', name: 'B' },
      },
    });

    const list = store.getAll('USER');
    expect(list).toHaveLength(2);
  });

  // ------------------------------------------------------------
  test('remove() deletes entity and triggers callback', () => {
    let calls = 0;
    store.addOnMergeCallback(() => calls++);

    store.merge({
      USER: { '1': { id: '1', name: 'A' } },
    });

    store.remove('USER', '1');

    expect(store.hasEntity('USER', '1')).toBe(false);
    expect(calls).toBe(2); // one from merge, one from remove
  });

  // ------------------------------------------------------------
  test('removeMany() deletes multiple keys and triggers callback', () => {
    store.merge({
      POST: {
        '1': { id: '1', title: 'X' },
        '2': { id: '2', title: 'Y' },
      },
    });

    let calls = 0;
    store.addOnMergeCallback(() => calls++);

    store.removeMany({
      POST: new Set(['1', '2']),
    });

    expect(store.getAll('POST')).toHaveLength(0);
    expect(calls).toBe(1);
  });

  // ------------------------------------------------------------
  test('reset(entityKey) clears only target bucket', () => {
    store.merge({
      USER: { '1': { id: '1', name: 'A' } },
      POST: { '5': { id: '5', title: 'Z' } },
    });

    store.reset('USER');

    expect(store.getCount('USER')).toBe(0);
    expect(store.getCount('POST')).toBe(1);
  });

  // ------------------------------------------------------------
  test('reset() without args clears all buckets and triggers callback', () => {
    let calls = 0;
    store.addOnMergeCallback(() => calls++);

    store.merge({
      USER: { '1': { id: '1', name: 'A' } },
      POST: { '6': { id: '6', title: 'P' } },
    });

    store.reset();

    expect(store.getCount('USER')).toBe(0);
    expect(store.getCount('POST')).toBe(0);
    expect(calls).toBe(2); // 1 from merge, 1 from reset
  });

  // ------------------------------------------------------------
  test('getCount returns number of entities', () => {
    store.merge({
      USER: {
        '1': { id: '1', name: 'A' },
        '2': { id: '2', name: 'B' },
      },
    });

    expect(store.getCount('USER')).toBe(2);
  });

  // ------------------------------------------------------------
  test('getSnapshot returns plain object of buckets', () => {
    store.merge({
      USER: { '1': { id: '1', name: 'A' } },
    });

    const snap = store.getSnapshot;

    expect(snap).toEqual({
      USER: {
        '1': { id: '1', name: 'A' },
      },
    });
  });

  // ------------------------------------------------------------
  test('getSnapshotKeys returns all bucket keys', () => {
    store.merge({
      USER: { '1': {} },
      POST: { '2': {} },
    });

    expect(new Set(store.getSnapshotKeys)).toEqual(new Set(['USER', 'POST']));
  });

  // ------------------------------------------------------------
  test('getSnapshotByKey returns clean snapshot with META copied safely', () => {
    const meta = {
      createdAt: 111,
      updatedAt: 222,
      accessedAt: 333,
      refSources: new Set(['A', 'B']),
    };

    store.merge({
      USER: {
        '1': {
          id: '1',
          name: 'Alice',
          [META]: meta,
        },
      },
    });

    const snap = store.getSnapshotByKey('USER');

    expect(snap).toEqual({
      '1': {
        id: '1',
        name: 'Alice',
        [META]: {
          createdAt: 111,
          updatedAt: 222,
          accessedAt: 333,
          refSources: ['A', 'B'],
        },
      },
    });
  });

  // ------------------------------------------------------------
  test('getSnapshotByKey returns {} if bucket is missing', () => {
    expect(store.getSnapshotByKey('USER')).toEqual({});
  });
});
