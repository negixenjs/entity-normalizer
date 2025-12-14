import { StoreProxy } from '../proxy';

describe('StoreProxy', () => {
  let root: any;
  let notify: jest.Mock;
  let target: any;

  beforeEach(() => {
    notify = jest.fn();

    root = {
      getPersistence: () => ({
        onStoreStateChanged: notify,
      }),
    };

    target = {
      x: 1,

      actionSync: jest.fn(function () {
        this.x = 2;
        return 'SYNC';
      }),

      actionAsync: jest.fn(function () {
        return Promise.resolve().then(() => {
          this.x = 3;
          return 'ASYNC';
        });
      }),

      nonAction: jest.fn(),
    };
  });

  const flush = async () => {
    await Promise.resolve();
    await Promise.resolve();
  };

  function buildProxy(actions: string[]) {
    return new StoreProxy(root, target, actions).build();
  }

  // -------------------------------------------------------
  it('wraps only declared actions', () => {
    const proxy = buildProxy(['actionSync']);

    expect(proxy.actionSync).not.toBe(target.actionSync);
    expect(proxy.nonAction).toBe(target.nonAction);
  });

  // -------------------------------------------------------
  it('notifies after sync action', async () => {
    const proxy = buildProxy(['actionSync']);

    const result = proxy.actionSync();
    expect(result).toBe('SYNC');

    await flush();

    expect(notify).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------
  it('notifies after async action resolves', async () => {
    const proxy = buildProxy(['actionAsync']);

    const result = proxy.actionAsync();
    expect(result).toBeInstanceOf(Promise);

    await result;
    await flush();

    expect(notify).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------
  it('notifies on direct property mutation', async () => {
    const proxy = buildProxy([]);

    proxy.x = 999;
    expect(proxy.x).toBe(999);

    await flush();

    expect(notify).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------
  it('preserves "this" context for wrapped actions', async () => {
    const proxy = buildProxy(['actionSync']);

    proxy.actionSync();

    expect(target.actionSync.mock.instances[0]).toBe(target);

    await flush();
    expect(notify).toHaveBeenCalled();
  });

  // -------------------------------------------------------
  it('returns raw values for non-function fields', () => {
    const proxy = buildProxy(['actionSync']);
    expect(proxy.x).toBe(1);
  });

  // -------------------------------------------------------
  it('does not wrap actions not listed', () => {
    const proxy = buildProxy([]);

    expect(proxy.actionSync).toBe(target.actionSync);
  });
});
