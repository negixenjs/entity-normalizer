import { StoreManager } from '../manager';

jest.mock('mobx', () => ({
  runInAction: (fn: any) => fn(),
}));

class TestStore {
  constructor(public deps: any) {}

  x = 1;

  actionOne() {}
  actionTwo() {}
}

describe('StoreManager (integration)', () => {
  let deps: any;
  let manager: StoreManager;
  let notify: jest.Mock;

  beforeEach(() => {
    notify = jest.fn();

    deps = {
      domain: { foo: 1 },
      system: {
        getPersistence: () => ({
          onStoreStateChanged: notify,
        }),
      },
    };

    manager = new StoreManager(deps);
  });

  // -------------------------------------
  it('creates store instance and wraps it with proxy', () => {
    const store = manager.create(TestStore);

    expect(store).toBeDefined();
    expect(store).toBeInstanceOf(TestStore);
  });

  // -------------------------------------
  it('injects deps into store constructor', () => {
    const store = manager.create(TestStore);

    expect(store.deps).toBe(deps.domain);
  });

  // -------------------------------------
  it('attaches hidden snapshot APIs', () => {
    const store: any = manager.create(TestStore);

    expect(typeof store.__getSnapshot).toBe('function');
    expect(typeof store.__applySnapshot).toBe('function');
  });

  // -------------------------------------
  it('attaches resetStore via Cleaner', () => {
    const store: any = manager.create(TestStore);

    expect(typeof store.resetStore).toBe('function');
  });

  // -------------------------------------
  it('wraps actions and triggers persist notify', async () => {
    const store: any = manager.create(TestStore);

    store.actionOne();

    // microtask flush
    await Promise.resolve();

    expect(notify).toHaveBeenCalled();
  });
});
