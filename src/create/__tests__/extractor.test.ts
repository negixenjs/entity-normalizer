import { StoreSnapshotExtractor } from '../extractor';
import { Scanner, type StoreShape } from '../scanner';

jest.mock('mobx', () => ({
  runInAction: (fn: any) => fn(),
}));

describe('StoreSnapshotExtractor', () => {
  let extractor: StoreSnapshotExtractor;
  let scanner: Scanner;

  beforeEach(() => {
    scanner = new Scanner();
    extractor = new StoreSnapshotExtractor(scanner);
  });

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  function createSingleCollection(snapshot: any) {
    return {
      getSnapshot: jest.fn(() => snapshot),
      applySnapshot: jest.fn(),
    };
  }

  function createMultiCollection(snapshot: any) {
    return {
      getMultiSnapshot: jest.fn(() => snapshot),
      applyMultiSnapshot: jest.fn(),
    };
  }

  function createRecord(snapshot: any) {
    return {
      getSnapshot: jest.fn(() => snapshot),
      applySnapshot: jest.fn(),
    };
  }

  // --------------------------------------------------
  // getSnapshot
  // --------------------------------------------------

  describe('getSnapshot()', () => {
    it('extracts plain fields', () => {
      const store: any = {
        a: 1,
        b: 'x',
      };

      const shape: StoreShape = {
        plain: { a: 1, b: 'x' },
        single: [],
        multi: [],
        records: [],
        actions: [],
      };

      const snap = extractor.getSnapshot(store, shape);

      expect(snap).toEqual({
        a: 1,
        b: 'x',
      });
    });

    it('extracts single collections via getSnapshot()', () => {
      const listSnap = { items: [1, 2] };

      const store: any = {
        list: createSingleCollection(listSnap),
      };

      const shape: StoreShape = {
        plain: {},
        single: ['list'],
        multi: [],
        records: [],
        actions: [],
      };

      const snap = extractor.getSnapshot(store, shape);

      expect(store.list.getSnapshot).toHaveBeenCalled();
      expect(snap).toEqual({
        list: listSnap,
      });
    });

    it('extracts multi collections via getMultiSnapshot()', () => {
      const multiSnap = {
        a: { items: [1] },
        b: { items: [2] },
      };

      const store: any = {
        mc: createMultiCollection(multiSnap),
      };

      const shape: StoreShape = {
        plain: {},
        single: [],
        multi: ['mc'],
        records: [],
        actions: [],
      };

      const snap = extractor.getSnapshot(store, shape);

      expect(store.mc.getMultiSnapshot).toHaveBeenCalled();
      expect(snap).toEqual({
        mc: multiSnap,
      });
    });

    it('extracts records via getSnapshot()', () => {
      const recSnap = { id: '1' };

      const store: any = {
        rec: createRecord(recSnap),
      };

      const shape: StoreShape = {
        plain: {},
        single: [],
        multi: [],
        records: ['rec'],
        actions: [],
      };

      const snap = extractor.getSnapshot(store, shape);

      expect(store.rec.getSnapshot).toHaveBeenCalled();
      expect(snap).toEqual({
        rec: recSnap,
      });
    });
  });

  // --------------------------------------------------
  // applySnapshot
  // --------------------------------------------------

  describe('applySnapshot()', () => {
    it('applies plain fields', () => {
      const store: any = {
        a: 1,
        b: 'x',
      };

      const shape: StoreShape = {
        plain: { a: 1, b: 'x' },
        single: [],
        multi: [],
        records: [],
        actions: [],
      };

      extractor.applySnapshot(store, { a: 10, b: 'y' }, shape);

      expect(store.a).toBe(10);
      expect(store.b).toBe('y');
    });

    it('applies single collections via applySnapshot()', () => {
      const col = createSingleCollection(null);

      const store: any = {
        list: col,
      };

      const shape: StoreShape = {
        plain: {},
        single: ['list'],
        multi: [],
        records: [],
        actions: [],
      };

      const snap = { items: [1, 2] };

      extractor.applySnapshot(store, { list: snap }, shape);

      expect(col.applySnapshot).toHaveBeenCalledWith(snap, { silent: true });
    });

    it('applies multi collections via applyMultiSnapshot()', () => {
      const mc = createMultiCollection(null);

      const store: any = {
        mc,
      };

      const shape: StoreShape = {
        plain: {},
        single: [],
        multi: ['mc'],
        records: [],
        actions: [],
      };

      const snap = {
        a: { items: [1] },
      };

      extractor.applySnapshot(store, { mc: snap }, shape);

      expect(mc.applyMultiSnapshot).toHaveBeenCalledWith(snap);
    });

    it('applies records via applySnapshot()', () => {
      const rec = createRecord(null);

      const store: any = {
        rec,
      };

      const shape: StoreShape = {
        plain: {},
        single: [],
        multi: [],
        records: ['rec'],
        actions: [],
      };

      const snap = { id: '123' };

      extractor.applySnapshot(store, { rec: snap }, shape);

      expect(rec.applySnapshot).toHaveBeenCalledWith(snap);
    });

    it('does nothing if snapshot is null', () => {
      const store: any = { a: 1 };

      const shape: StoreShape = {
        plain: { a: 1 },
        single: [],
        multi: [],
        records: [],
        actions: [],
      };

      extractor.applySnapshot(store, null, shape);

      expect(store.a).toBe(1);
    });
  });
});
