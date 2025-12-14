//@ts-nocheck
import { BucketCollector } from '../bucket';
import { SchemaWalker } from '../walker';

import type { TEntitiesStore } from '../../types';

// -----------------------------
// MOCK ENTITIES
// -----------------------------
const createMockEntities = (data: Record<string, any>) =>
  ({
    getEntity: (key: string, id: string) => data[key]?.[id],
  }) as unknown as TEntitiesStore;

// -----------------------------
// MOCK SCHEMA
// -----------------------------
const walker = new SchemaWalker({
  A: {
    key: 'A',
    definition: {
      b: { key: 'B', definition: {} },
      cList: [{ key: 'C', definition: {} }],
    },
  },
  B: {
    key: 'B',
    definition: {
      c: { key: 'C', definition: {} },
    },
  },
  C: {
    key: 'C',
    definition: {},
  },
} as any);

// ============================================================
// TESTS
// ============================================================
describe('BucketCollector', () => {
  test('collects single entity', () => {
    const entities = createMockEntities({
      A: {
        '1': { id: '1' },
      },
    });

    const collector = new BucketCollector(entities, walker);
    const out = collector.collect('A', '1');

    expect(out).toEqual({
      A: new Set(['1']),
    });
  });

  test('collects nested single reference (A -> B)', () => {
    const entities = createMockEntities({
      A: {
        '1': { bId: '10' },
      },
      B: {
        '10': {},
      },
    });

    const collector = new BucketCollector(entities, walker);
    const out = collector.collect('A', '1');

    expect(out).toEqual({
      A: new Set(['1']),
      B: new Set(['10']),
    });
  });

  test('collects array reference (A -> C[])', () => {
    const entities = createMockEntities({
      A: {
        '1': { cListId: ['21', '22'] },
      },
      C: {
        '21': {},
        '22': {},
      },
    });

    const collector = new BucketCollector(entities, walker);
    const out = collector.collect('A', '1');

    expect(out).toEqual({
      A: new Set(['1']),
      C: new Set(['21', '22']),
    });
  });

  test('collects deep chain A -> B -> C', () => {
    const entities = createMockEntities({
      A: { '1': { bId: '10' } },
      B: { '10': { cId: '77' } },
      C: { '77': {} },
    });

    const collector = new BucketCollector(entities, walker);
    const out = collector.collect('A', '1');

    expect(out).toEqual({
      A: new Set(['1']),
      B: new Set(['10']),
      C: new Set(['77']),
    });
  });

  test('handles cycles without infinite loop', () => {
    const cyclicWalker = new SchemaWalker({
      A: {
        key: 'A',
        definition: {
          b: { key: 'B', definition: {} },
        },
      },
      B: {
        key: 'B',
        definition: {
          a: { key: 'A', definition: {} },
        },
      },
    } as any);

    const entities = createMockEntities({
      A: { '1': { bId: '10' } },
      B: { '10': { aId: '1' } },
    });

    const collector = new BucketCollector(entities, cyclicWalker);
    const out = collector.collect('A', '1');

    expect(out).toEqual({
      A: new Set(['1']),
      B: new Set(['10']),
    });
  });

  test('ignores missing entities safely', () => {
    const entities = createMockEntities({
      A: { '1': { bId: '999' } },
      B: {},
    });

    const collector = new BucketCollector(entities, walker);
    const out = collector.collect('A', '1');

    expect(out).toEqual({
      A: new Set(['1']),
    });
  });
});
