import { Cleaner } from '../cleaner';

jest.mock('mobx', () => ({
  runInAction: (fn: any) => fn(),
}));

describe('Cleaner.applyReset()', () => {
  let root: any;
  let cleaner: Cleaner;
  let notify: jest.Mock;

  beforeEach(() => {
    notify = jest.fn();

    root = {
      getPersistence: () => ({
        onStoreStateChanged: notify,
      }),
    };

    cleaner = new Cleaner(root);
  });

  // -----------------------------------------
  // Helpers
  // -----------------------------------------

  const createSingleCol = () => ({
    reset: jest.fn(),
  });

  const createMultiCol_with_resetAll = () => ({
    resetAll: jest.fn(),
  });

  const createMultiCol_with_subcollections = () => {
    const colA = { reset: jest.fn() };
    const colB = { reset: jest.fn() };

    return {
      getSubCollections: () =>
        new Map([
          ['a', colA],
          ['b', colB],
        ]),
      __subs: { colA, colB },
    };
  };

  const baseShape = {
    plain: {},
    single: [],
    multi: [],
    records: [],
  };

  // -----------------------------------------
  // TEST 1 — reset plain fields
  // -----------------------------------------
  it('resets plain fields to initial values', () => {
    const store: any = {
      x: 10,
      y: 'hello',
    };

    cleaner.applyReset(store, {
      ...baseShape,
      plain: { x: 1, y: 'init' },
    });

    store.resetStore();

    expect(store.x).toBe(1);
    expect(store.y).toBe('init');
  });

  // -----------------------------------------
  // TEST 2 — reset single collections
  // -----------------------------------------
  it('resets single collections via .reset()', () => {
    const colA = createSingleCol();

    const store: any = {
      list: colA,
    };

    cleaner.applyReset(store, {
      ...baseShape,
      single: ['list'],
    });

    store.resetStore();

    expect(colA.reset).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------
  // TEST 3 — reset multi (with resetAll)
  // -----------------------------------------
  it('resets multi-collection via resetAll()', () => {
    const multi = createMultiCol_with_resetAll();

    const store: any = {
      mc: multi,
    };

    cleaner.applyReset(store, {
      ...baseShape,
      multi: ['mc'],
    });

    store.resetStore();

    expect(multi.resetAll).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------
  // TEST 4 — reset multi (with sub-collections)
  // -----------------------------------------
  it('resets multi-collection via getSubCollections()', () => {
    const multi = createMultiCol_with_subcollections();

    const store: any = {
      mc: multi,
    };

    cleaner.applyReset(store, {
      ...baseShape,
      multi: ['mc'],
    });

    store.resetStore();

    expect(multi.__subs.colA.reset).toHaveBeenCalledTimes(1);
    expect(multi.__subs.colB.reset).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------
  // TEST 5 — does NOT override existing resetStore
  // -----------------------------------------
  it('does not override existing resetStore (hot reload protection)', () => {
    const original = jest.fn();

    const store: any = {
      resetStore: original,
    };

    cleaner.applyReset(store, baseShape);

    expect(store.resetStore).toBe(original);
  });

  // -----------------------------------------
  // TEST 6 — notifyStoreStateChanged after reset
  // -----------------------------------------
  it('calls notifyStoreStateChanged() after reset (async)', async () => {
    const store: any = {};

    cleaner.applyReset(store, baseShape);
    store.resetStore();

    // flush microtask
    await Promise.resolve();

    expect(root.getPersistence().onStoreStateChanged).toHaveBeenCalledTimes(1);
  });
});
