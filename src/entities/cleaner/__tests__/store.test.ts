//@ts-nocheck
import { META } from '../../../constants/values';
import { EntityCleanerStore } from '../store';

// -----------------------------
// MOCK SCHEMA
// -----------------------------
const makeSchema = (def: any) => ({
  key: '',
  definition: def,
});

const mockSchemaMap: Record<string, any> = {
  A: makeSchema({
    b: { key: 'B', definition: {} },
    cList: [{ key: 'C', definition: {} }],
  }),
  B: makeSchema({
    c: { key: 'C', definition: {} },
  }),
  C: makeSchema({}),
};

// -----------------------------
// MOCK ENTITIES STORE
// -----------------------------
const mockEntities = (data: Record<string, Record<string, any>>) => ({
  getEntity: (key: string, id: string) => data[key]?.[id],
  removeMany: jest.fn(),
});

// -----------------------------
// Helper to wrap entity with META
// -----------------------------
const e = (obj: any, refs: string[] = []) => ({
  ...obj,
  [META]: {
    createdAt: 1,
    updatedAt: 1,
    accessedAt: 1,
    refSources: new Set(refs),
  },
});

// ============================================================
// TESTS
// ============================================================
describe('EntityCleanerStore', () => {
  test('deletes simple chain A -> B -> C', () => {
    const store = mockEntities({
      A: { '1': e({ id: '1', bId: '10' }, ['root']) },
      B: { '10': e({ id: '10', cId: '77' }, ['root']) },
      C: { '77': e({ id: '77' }, ['root']) },
    });

    const cleaner = new EntityCleanerStore(store as any, mockSchemaMap);
    cleaner.deleteCascade('A', ['1'], 'root');

    expect(store.removeMany).toHaveBeenCalledWith({
      A: new Set(['1']),
      B: new Set(['10']),
      C: new Set(['77']),
    });
  });

  test('handles array references A -> C[]', () => {
    const store = mockEntities({
      A: { '1': e({ id: '1', cListId: ['21', '22'] }, ['root']) },
      B: {},
      C: {
        '21': e({ id: '21' }, ['root']),
        '22': e({ id: '22' }, ['root']),
      },
    });

    const cleaner = new EntityCleanerStore(store as any, mockSchemaMap);
    cleaner.deleteCascade('A', ['1'], 'root');

    expect(store.removeMany).toHaveBeenCalledWith({
      A: new Set(['1']),
      C: new Set(['21', '22']),
    });
  });

  test('deep chain A -> B -> C', () => {
    const store = mockEntities({
      A: { '1': e({ id: '1', bId: '10' }, ['root']) },
      B: { '10': e({ id: '10', cId: '77' }, ['root']) },
      C: { '77': e({ id: '77' }, ['root']) },
    });

    const cleaner = new EntityCleanerStore(store as any, mockSchemaMap);
    cleaner.deleteCascade('A', ['1'], 'root');

    expect(store.removeMany).toHaveBeenCalledWith({
      A: new Set(['1']),
      B: new Set(['10']),
      C: new Set(['77']),
    });
  });

  test('cycles do not loop infinitely', () => {
    const cyclicSchemaMap = {
      A: makeSchema({ b: { key: 'B', definition: {} } }),
      B: makeSchema({ a: { key: 'A', definition: {} } }),
    };

    const store = mockEntities({
      A: { '1': e({ id: '1', bId: '10' }, ['root']) },
      B: { '10': e({ id: '10', aId: '1' }, ['root']) },
    });

    const cleaner = new EntityCleanerStore(store as any, cyclicSchemaMap);
    cleaner.deleteCascade('A', ['1'], 'root');

    expect(store.removeMany).toHaveBeenCalledWith({
      A: new Set(['1']),
      B: new Set(['10']),
    });
  });

  test('entity with multiple refs is NOT deleted', () => {
    const store = mockEntities({
      A: { '1': e({ id: '1', bId: '10' }, ['ref1', 'ref2']) },
      B: { '10': e({ id: '10' }, ['ref1']) },
      C: {},
    });

    const cleaner = new EntityCleanerStore(store as any, mockSchemaMap);
    cleaner.deleteCascade('A', ['1'], 'ref1');

    // A still has ref2, B loses ref1 → deletable
    expect(store.removeMany).toHaveBeenCalledWith({
      B: new Set(['10']),
    });
  });

  test('multiple root IDs', () => {
    const store = mockEntities({
      A: {
        '1': e({ id: '1', cListId: ['21'] }, ['root']),
        '2': e({ id: '2', cListId: ['22'] }, ['root']),
      },
      B: {},
      C: {
        '21': e({ id: '21' }, ['root']),
        '22': e({ id: '22' }, ['root']),
      },
    });

    const cleaner = new EntityCleanerStore(store as any, mockSchemaMap);
    cleaner.deleteCascade('A', ['1', '2'], 'root');

    expect(store.removeMany).toHaveBeenCalledWith({
      A: new Set(['1', '2']),
      C: new Set(['21', '22']),
    });
  });
});
