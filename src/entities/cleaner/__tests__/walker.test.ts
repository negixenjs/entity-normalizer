//@ts-nocheck
import { EntitySchema } from '../../schema';
import { SchemaWalker } from '../walker';

const schemaA = new EntitySchema('A' as string, {
  b: new EntitySchema('B' as string),
  c: [new EntitySchema('C' as string)],
});

const schemaB = new EntitySchema('B' as string, {
  c: new EntitySchema('C' as string),
});

const schemaC = new EntitySchema('C' as string, {});

const schemaMap = {
  A: schemaA,
  B: schemaB,
  C: schemaC,
} as const;

describe('SchemaWalker', () => {
  const walker = new SchemaWalker(schemaMap);

  test('walks single nested reference (A -> B)', () => {
    const entity = {
      bId: '10',
    };

    const result: Array<[string, string | number]> = [];

    walker.walkFields('A', entity, (key, id) => {
      result.push([key, id]);
    });

    expect(result).toEqual([['B', '10']]);
  });

  test('walks array nested reference (A -> C[])', () => {
    const entity = {
      cId: ['21', '22'],
    };

    const result: Array<[string, string | number]> = [];

    walker.walkFields('A', entity, (key, id) => {
      result.push([key, id]);
    });

    expect(result).toEqual([
      ['C', '21'],
      ['C', '22'],
    ]);
  });

  test('walks deep nested references A -> B -> C', () => {
    const entityA = { bId: '10' };
    const entityB = { cId: '77' };

    const callsA: Array<[string, string | number]> = [];
    const callsB: Array<[string, string | number]> = [];

    walker.walkFields('A', entityA, (key, id) => {
      callsA.push([key, id]);
    });

    walker.walkFields('B', entityB, (key, id) => {
      callsB.push([key, id]);
    });

    expect(callsA).toEqual([['B', '10']]);
    expect(callsB).toEqual([['C', '77']]);
  });

  test('ignores missing fields', () => {
    const entity = {}; // no bId, no cId

    const result: any[] = [];

    walker.walkFields('A', entity, (key, id) => {
      result.push([key, id]);
    });

    expect(result).toEqual([]);
  });

  test('skips non-array values for array schema', () => {
    const entity = {
      cId: 'not-array',
    };

    const result: any[] = [];

    walker.walkFields('A', entity, (key, id) => {
      result.push([key, id]);
    });

    expect(result).toEqual([]);
  });

  test('handles empty array in array schema', () => {
    const entity = {
      cId: [],
    };

    const result: any[] = [];

    walker.walkFields('A', entity, (key, id) => {
      result.push([key, id]);
    });

    expect(result).toEqual([]);
  });
});
