import { DUCK_TAG } from '../../async/marker';
import {
  MULTI_COLLECTION_TAG,
  COLLECTION_TAG,
} from '../../entities/collection/marker';
import { Scanner } from '../scanner';

// --- helpers / mocks ---
function duck() {
  return { [DUCK_TAG]: true };
}

function singleCol() {
  return { [COLLECTION_TAG]: true };
}

function multiCol() {
  return { [MULTI_COLLECTION_TAG]: true };
}

class TestStore {
  a = 1;
  b = 'x';
  c = true;

  fnArrow = () => {};
  fnMethod() {}

  duck = duck();
  col = singleCol();
  multi = multiCol();

  constructor(public root: any) {}
}

describe('Scanner', () => {
  let scanner: Scanner;
  let store: TestStore;

  beforeEach(() => {
    scanner = new Scanner();
    store = new TestStore({ __root__: true });
  });

  // -----------------------------
  // scanPlain
  // -----------------------------
  describe('scanPlain()', () => {
    it('includes only plain serializable fields', () => {
      const plain = scanner.scanPlain(store);

      expect(plain).toEqual({
        a: 1,
        b: 'x',
        c: true,
      });
    });

    it('excludes functions', () => {
      const plain = scanner.scanPlain(store);

      expect(plain).not.toHaveProperty('fnArrow');
      expect(plain).not.toHaveProperty('fnMethod');
    });

    it('excludes duck objects', () => {
      const plain = scanner.scanPlain(store);
      expect(plain).not.toHaveProperty('duck');
    });

    it('excludes single collections', () => {
      const plain = scanner.scanPlain(store);
      expect(plain).not.toHaveProperty('col');
    });

    it('excludes multi collections', () => {
      const plain = scanner.scanPlain(store);
      expect(plain).not.toHaveProperty('multi');
    });
  });

  // -----------------------------
  // scanSingleKeys
  // -----------------------------
  describe('scanSingleKeys()', () => {
    it('returns keys of single collections only', () => {
      const single = scanner.scanSingleKeys(store);
      expect(single).toEqual(['col']);
    });
  });

  // -----------------------------
  // scanMultiKeys
  // -----------------------------
  describe('scanMultiKeys()', () => {
    it('returns keys of multi collections only', () => {
      const multi = scanner.scanMultiKeys(store);
      expect(multi).toEqual(['multi']);
    });
  });

  // -----------------------------
  // scanActions
  // -----------------------------
  describe('scanActions()', () => {
    it('detects arrow functions + prototype methods', () => {
      const actions = scanner.scanActions(store);

      expect(actions).toContain('fnArrow');
      expect(actions).toContain('fnMethod');
    });

    it('does NOT include duck objects', () => {
      const actions = scanner.scanActions(store);
      expect(actions).not.toContain('duck');
    });
  });

  // -----------------------------
  // scan() full integration
  // -----------------------------
  describe('scan()', () => {
    it('produces correct full shape', () => {
      const shape = scanner.scan(store);

      expect(shape).toEqual({
        plain: { a: 1, b: 'x', c: true },
        single: ['col'],
        multi: ['multi'],
        records: [],
        actions: expect.arrayContaining(['fnArrow', 'fnMethod']),
      });
    });
  });
});
