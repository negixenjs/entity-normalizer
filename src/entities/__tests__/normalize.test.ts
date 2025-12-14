// @ts-nocheck

import { createNormalizer } from '../normalize';
import { EntitySchema } from '../schema';

const { normalize } = createNormalizer();

// ---------- DTO TYPES ----------
interface UserDto {
  id: string;
  name?: string;
}

interface CommentDto {
  id: string;
  text: string;
  user?: UserDto;
}

interface PostDto {
  id: string;
  title: string;
  author?: UserDto;
  comments?: CommentDto[];
}

// ---------- SCHEMAS ----------
const userSchema = new EntitySchema('user');

const commentSchema = new EntitySchema('comment', {
  user: userSchema,
});

const postSchema = new EntitySchema('post', {
  author: userSchema,
  comments: [commentSchema],
});

// ======================================================
//                  TEST SUITE
// ======================================================

describe('Normalizer', () => {
  // --------------------------------------------------
  test('normalizes a flat entity', () => {
    const input = { id: '1', name: 'Alice' };

    const out = normalize(input, userSchema);

    expect(out.ids).toEqual(['1']);
    expect(out.map.user?.['1']).toEqual({
      id: '1',
      name: 'Alice',
    });
  });

  // --------------------------------------------------
  test('normalizes an array of flat entities', () => {
    const input = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];

    const out = normalize(input, [userSchema]);

    expect(out.ids).toEqual(['1', '2']);
    expect(Object.keys(out.map.user!)).toHaveLength(2);
  });

  // --------------------------------------------------
  test('normalizes nested object (post → author)', () => {
    const input: PostDto = {
      id: '10',
      title: 'Hello',
      author: { id: '1', name: 'Alice' },
    };

    const out = normalize(input, postSchema);

    expect(out.ids).toEqual(['10']);

    expect(out.map.post?.['10']).toEqual({
      id: '10',
      title: 'Hello',
      authorId: '1',
    });

    expect(out.map.user?.['1']).toEqual({
      id: '1',
      name: 'Alice',
    });
  });

  // --------------------------------------------------
  test('normalizes nested array (post → comments[])', () => {
    const input: PostDto = {
      id: '10',
      title: 'Hello',
      comments: [
        { id: 'c1', text: 'Nice', user: { id: '1', name: 'Alice' } },
        { id: 'c2', text: 'Wow', user: { id: '2', name: 'Bob' } },
      ],
    };

    const out = normalize(input, postSchema);

    expect(out.map.post?.['10']).toEqual({
      id: '10',
      title: 'Hello',
      commentsId: ['c1', 'c2'],
    });

    expect(out.map.comment?.['c1']).toEqual({
      id: 'c1',
      text: 'Nice',
      userId: '1',
    });

    expect(out.map.user?.['1']).toEqual({
      id: '1',
      name: 'Alice',
    });
  });

  // --------------------------------------------------
  test('removes nested objects, leaving only *Id fields', () => {
    const input = {
      id: '10',
      title: 'Hello',
      author: { id: '1', name: 'Alice' },
    };

    const out = normalize(input, postSchema);

    expect(out.map.post?.['10']).toEqual({
      id: '10',
      title: 'Hello',
      authorId: '1',
    });
  });

  // --------------------------------------------------
  test('supports idAttribute override', () => {
    const customUserSchema = new EntitySchema(
      'user',
      {},
      { idAttribute: 'uuid' },
    );

    const input = { uuid: 'u1', name: 'Admin' };

    const out = normalize(input, customUserSchema);

    expect(out.ids).toEqual(['u1']);
    expect(out.map.user?.['u1']).toEqual({
      uuid: 'u1',
      name: 'Admin',
    });
  });

  // --------------------------------------------------
  test('handles circular references (user → friend → user)', () => {
    const a: any = { id: 'a' };
    const b: any = { id: 'b', friend: a };
    a.friend = b;

    const nodeSchema = new EntitySchema('node', {
      friend: undefined as any,
    });

    nodeSchema.definition.friend = nodeSchema;

    const out = normalize(a, nodeSchema);

    expect(out.ids).toEqual(['a']);
    expect(out.map.node?.['a']).toBeDefined();
    expect(out.map.node?.['b']).toBeDefined();
  });

  // --------------------------------------------------
  test('supports complex circular chain (post → user → post → user)', () => {
    const post: any = { id: 'p1' };
    const user: any = { id: 'u1' };

    post.author = user;
    user.favoritePost = post;

    const userSchema2 = new EntitySchema('user', {
      favoritePost: undefined as any,
    });

    const postSchema2 = new EntitySchema('post', {
      author: userSchema2,
    });

    // link circular schema
    userSchema2.definition.favoritePost = postSchema2;

    const out = normalize(post, postSchema2);

    expect(out.map.post?.['p1']).toBeDefined();
    expect(out.map.user?.['u1']).toBeDefined();

    expect(out.map.post?.['p1'].authorId).toBe('u1');
    expect(out.map.user?.['u1'].favoritePostId).toBe('p1');
  });

  // --------------------------------------------------
  test('reconstructs minimal nested entities via "*Id"', () => {
    const input = {
      id: '10',
      viewerId: 'v1',
    };

    const schema = new EntitySchema('post', {
      viewer: new EntitySchema('viewer'),
    });

    const out = normalize([input], schema);

    expect(out.map.post?.['10']).toEqual({
      id: '10',
      viewerId: 'v1',
    });

    expect(out.map.viewer?.['v1']).toEqual({
      id: 'v1',
      __partial: true,
    });
  });

  // --------------------------------------------------
  test('normalizes deep tree recursively', () => {
    const deep = {
      id: 'p1',
      title: 'x',
      comments: [
        {
          id: 'c1',
          text: '1',
          user: {
            id: 'u1',
            name: 'vasyl',
            friend: { id: 'u2', name: 'ivan' },
          },
        },
      ],
    };

    const userSchemaDeep = new EntitySchema('user', {
      friend: undefined as any,
    });

    userSchemaDeep.definition.friend = userSchemaDeep;

    const commentSchemaDeep = new EntitySchema('comment', {
      user: userSchemaDeep,
    });

    const postSchemaDeep = new EntitySchema('post', {
      comments: [commentSchemaDeep],
    });

    const out = normalize(deep, postSchemaDeep);

    expect(out.ids).toEqual(['p1']);
    expect(out.map.user?.['u1']).toBeDefined();
    expect(out.map.user?.['u2']).toBeDefined();
    expect(out.map.comment?.['c1']).toBeDefined();
    expect(out.map.post?.['p1']).toBeDefined();
  });
});
