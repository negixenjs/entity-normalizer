// @ts-nocheck
const mockNormalizer = { normalize: jest.fn() };

jest.mock('../normalize', () => ({
  createNormalizer: () => mockNormalizer,
}));

import { META } from '../../constants/values';
import {
  EntityProcessor,
  createEntityProcessor,
  createEntityRestorer,
} from '../processor';

// --------------------------------------------------
// TEST MODELS
// --------------------------------------------------

class TestViewerModel {
  constructor(dto: any) {
    Object.assign(this, dto);
  }
}

class TestPostModel {
  constructor(dto: any) {
    Object.assign(this, dto);
  }
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function createSchemaMock(overrides: any = {}) {
  return {
    model: overrides.model ?? undefined,
    process: overrides.process ?? jest.fn(i => ({ ...i })),
    merge: overrides.merge ?? jest.fn((a, b) => Object.assign(a, b)),
  };
}

function createEntitiesStoreMock() {
  const buckets: any = {};

  return {
    merge: jest.fn(incoming => {
      for (const key in incoming) {
        if (!buckets[key]) {
          buckets[key] = {};
        }
        Object.assign(buckets[key], incoming[key]);
      }
    }),
    getEntity: jest.fn((key, id) => buckets[key]?.[id]),
  };
}

const getMeta = (instance: any) => instance[META];

beforeEach(() => {
  jest.clearAllMocks();
  mockNormalizer.normalize.mockReset();
});

// ==================================================
// TESTS
// ==================================================

describe('EntityProcessor', () => {
  // ------------------------------------------------
  // HYDRATE
  // ------------------------------------------------

  it('hydrates entities using snapshot META', () => {
    const store = createEntitiesStoreMock();

    const schemaMap = {
      viewer: createSchemaMock({ model: TestViewerModel }),
    };

    const snapshot = {
      viewer: {
        '1': {
          id: '1',
          name: 'John',
          [META]: {
            createdAt: 10,
            updatedAt: 20,
            accessedAt: 30,
            refSources: ['feed'],
          },
        },
      },
    };

    const p = new EntityProcessor(store as any, schemaMap);
    p.hydrate(snapshot);

    expect(store.merge).toHaveBeenCalledTimes(1);

    const inst = store.merge.mock.calls[0][0].viewer['1'];
    expect(inst).toBeInstanceOf(TestViewerModel);

    const meta = getMeta(inst);
    expect(meta.createdAt).toBe(10);
    expect(meta.updatedAt).toBe(20);
    expect(meta.accessedAt).toBe(30);
    expect(Array.from(meta.refSources)).toEqual(['feed']);
  });

  it('hydrate skips unknown schema keys', () => {
    const store = createEntitiesStoreMock();

    const schemaMap = {
      post: createSchemaMock({ model: TestPostModel }),
    };

    const snapshot = {
      unknown: { x: { id: 'x', [META]: {} } },
      post: { '1': { id: '1', [META]: {} } },
    };

    const p = new EntityProcessor(store as any, schemaMap);
    p.hydrate(snapshot);

    const out = store.merge.mock.calls[0][0];

    expect(out.unknown).toBeUndefined();
    expect(out.post).toBeDefined();
  });

  it('hydrate does nothing on null / undefined', () => {
    const store = createEntitiesStoreMock();
    const schemaMap = {};

    const p = new EntityProcessor(store as any, schemaMap);
    p.hydrate(null);
    p.hydrate(undefined);

    expect(store.merge).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // PROCESS — NEW ENTITIES
  // ------------------------------------------------

  it('process() ingests new entities with META + refSources', () => {
    const store = createEntitiesStoreMock();

    const schemaMap = {
      post: createSchemaMock({ model: TestPostModel }),
    };

    mockNormalizer.normalize.mockReturnValue({
      ids: ['p1'],
      map: {
        post: { p1: { id: 'p1', title: 'Hello' } },
      },
    });

    const p = new EntityProcessor(store as any, schemaMap);

    const ids = p.process({
      data: [{ id: 'p1' }],
      entityKey: 'post',
      sourceRefId: 'feed',
      isCollection: true,
    });

    expect(ids).toEqual(['p1']);

    const inst = store.merge.mock.calls[0][0].post['p1'];
    expect(inst).toBeInstanceOf(TestPostModel);

    const meta = getMeta(inst);
    expect(meta.refSources.has('collection:feed')).toBe(true);
  });

  // ------------------------------------------------
  // PROCESS — MERGING
  // ------------------------------------------------

  it('process() merges into existing entity and updates META', () => {
    const store = createEntitiesStoreMock();

    const schemaMap = {
      viewer: createSchemaMock({ model: TestViewerModel }),
    };

    const existing = new TestViewerModel({ id: '1', name: 'Old' });

    Object.defineProperty(existing, META, {
      value: {
        createdAt: 10,
        updatedAt: 20,
        accessedAt: 30,
        refSources: new Set(['prev']),
      },
      writable: true,
    });

    store.getEntity.mockReturnValue(existing);

    mockNormalizer.normalize.mockReturnValue({
      ids: ['1'],
      map: { viewer: { '1': { id: '1', name: 'New' } } },
    });

    jest.spyOn(Date, 'now').mockReturnValue(555555);

    const p = new EntityProcessor(store as any, schemaMap);

    p.process({
      data: { id: '1' },
      entityKey: 'viewer',
      sourceRefId: 'profile',
      isCollection: false,
    });

    const meta = getMeta(existing);
    expect(meta.updatedAt).toBe(555555);
    expect(meta.accessedAt).toBe(555555);
    expect(meta.refSources.has('record:profile')).toBe(true);
  });

  // ------------------------------------------------
  // FACTORIES
  // ------------------------------------------------

  it('createEntityProcessor delegates to .process()', () => {
    const store = createEntitiesStoreMock();
    const schemaMap = {};

    const spy = jest
      .spyOn(EntityProcessor.prototype as any, 'process')
      .mockReturnValue(['OK']);

    const res = createEntityProcessor(store as any, schemaMap, {
      data: [],
      entityKey: 'post',
      sourceRefId: 'feed',
      isCollection: true,
    });

    expect(res).toEqual(['OK']);
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  it('createEntityRestorer delegates to hydrate()', () => {
    const store = createEntitiesStoreMock();
    const schemaMap = {};

    const spy = jest
      .spyOn(EntityProcessor.prototype as any, 'hydrate')
      .mockImplementation(() => {});

    const restorer = createEntityRestorer(store as any, schemaMap);

    restorer({ viewer: {} });

    expect(spy).toHaveBeenCalledWith({ viewer: {} });

    spy.mockRestore();
  });
});
