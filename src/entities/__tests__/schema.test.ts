// @ts-nocheck
import { EntitySchema } from '../schema';

describe('EntitySchema', () => {
  // ------------------------------------------------------------
  test('getId returns value using string idAttribute', () => {
    const schema = new EntitySchema('user', {}, { idAttribute: 'slug' });

    expect(schema.getId({ slug: 'a1' })).toBe('a1');
    expect(schema.getId({ slug: 123 })).toBe(123);
  });

  // ------------------------------------------------------------
  test('getId returns value using function idAttribute', () => {
    const schema = new EntitySchema(
      'user',
      {},
      {
        idAttribute: input => input.code,
      },
    );

    expect(schema.getId({ code: 'xyz' })).toBe('xyz');
  });

  // ------------------------------------------------------------
  test('getIdKey returns correct string key', () => {
    const schema1 = new EntitySchema('post', {}, { idAttribute: 'slug' });
    const schema2 = new EntitySchema('post', {}, {});

    expect(schema1.getIdKey()).toBe('slug');
    expect(schema2.getIdKey()).toBe('id'); // default
  });

  // ------------------------------------------------------------
  test('getIdKey returns "id" for function idAttribute', () => {
    const schema = new EntitySchema(
      'post',
      {},
      {
        idAttribute: o => o.uuid,
      },
    );

    expect(schema.getIdKey()).toBe('id');
  });

  // ------------------------------------------------------------
  test('process returns shallow clone by default', () => {
    const schema = new EntitySchema('user');
    const input = { a: 1, b: 2 };

    const processed = schema.process(input);

    expect(processed).toEqual(input);
    expect(processed).not.toBe(input); // new object
  });

  // ------------------------------------------------------------
  test('process uses custom processStrategy', () => {
    const schema = new EntitySchema(
      'user',
      {},
      {
        processStrategy: input => ({ ...input, extra: true }),
      },
    );

    const result = schema.process({ x: 1 });

    expect(result).toEqual({ x: 1, extra: true });
  });

  // ------------------------------------------------------------
  test('merge uses default Object.assign when no custom strategy provided', () => {
    const schema = new EntitySchema('user');

    const a = { x: 1, y: 2 };
    const b = { y: 100, z: 5 };

    const merged = schema.merge(a, b);

    expect(merged).toEqual({ x: 1, y: 100, z: 5 });
    expect(merged).toBe(a); // mutate a (Object.assign behavior)
  });

  // ------------------------------------------------------------
  test('merge uses custom mergeStrategy when provided', () => {
    const schema = new EntitySchema(
      'user',
      {},
      {
        mergeStrategy: (oldVal, newVal) => ({
          ...oldVal,
          ...newVal,
          merged: true,
        }),
      },
    );

    const merged = schema.merge({ x: 1 }, { y: 2 });

    expect(merged).toEqual({ x: 1, y: 2, merged: true });
  });

  // ------------------------------------------------------------
  test('definition stores nested schemas correctly', () => {
    const child = new EntitySchema('child');
    const parent = new EntitySchema('parent', {
      fieldA: child,
      fieldB: [child],
    });

    expect(parent.definition.fieldA).toBe(child);
    expect(parent.definition.fieldB[0]).toBe(child);
  });

  // ------------------------------------------------------------
  test('model getter returns model from options', () => {
    class UserModel {}

    const schema = new EntitySchema('user', {}, { model: UserModel });

    expect(schema.model).toBe(UserModel);
  });
});
