// @ts-nocheck
import { AsyncDuck } from '../async-duck';
import { DUCK_TAG } from '../marker';

// helper to flush microtasks
const flush = () => new Promise(res => setTimeout(res, 0));

describe('AsyncDuck', () => {
  // ------------------------------------------------------------
  test('run() success updates state correctly', async () => {
    const duck = new AsyncDuck(async (p: number) => p + 1);

    const result = await duck.run({ params: 5 });

    expect(result).toBe(6);
    expect(duck.isLoading).toBe(false);
    expect(duck.isError).toBe(false);
    expect(duck.isSuccess).toBe(true);
    expect(duck.data).toBe(6);
    expect(duck.hasEverRun).toBe(true);
  });

  // ------------------------------------------------------------
  test('run() error updates error state', async () => {
    const duck = new AsyncDuck(async () => {
      throw new Error('fail');
    });

    await duck.run();

    expect(duck.isError).toBe(true);
    expect(duck.error?.message).toBe('fail');
    expect(duck.isSuccess).toBe(false);
  });

  // ------------------------------------------------------------
  test('onSuccess and onError callbacks fire correctly', async () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const duck = new AsyncDuck(async (n: number) => n * 2);

    await duck.run({ params: 3, onSuccess });

    expect(onSuccess).toHaveBeenCalledWith(6);
    expect(onError).not.toHaveBeenCalled();

    // now error
    const duck2 = new AsyncDuck(async () => {
      throw new Error('err');
    });

    await duck2.run({ onError });

    expect(onError).toHaveBeenCalled();
  });

  // ------------------------------------------------------------
  test('skip option prevents execution', async () => {
    const fn = jest.fn(async () => 123);
    const duck = new AsyncDuck(fn);

    const result = await duck.run({ skip: true });

    expect(result).toBeUndefined();
    expect(fn).not.toHaveBeenCalled();
    expect(duck.hasEverRun).toBe(false);
  });

  // ------------------------------------------------------------
  test('while loading, run() returns cached data instead of rerunning fn', async () => {
    let resolveFn: any;

    const fn = jest.fn(
      () =>
        new Promise(res => {
          resolveFn = res;
        }),
    );

    const duck = new AsyncDuck(fn);

    const p1 = duck.run();
    const p2 = duck.run();
    const p3 = duck.run();

    expect(fn).toHaveBeenCalledTimes(1);

    resolveFn('done');
    await flush();

    expect(await p1).toBe('done');
    expect(await p2).toBe('done');
    expect(await p3).toBe('done');
  });

  // ------------------------------------------------------------
  test('keyed ducks: duck.proxy.someKey creates unique instance', async () => {
    const duck = new AsyncDuck(async (n: number) => n + 1);

    const keyedA = duck.proxy.one;
    const keyedB = duck.proxy.two;

    expect(keyedA).not.toBe(keyedB);
    expect(keyedA[DUCK_TAG]).toBe(true);

    await keyedA.run({ params: 1 });
    await keyedB.run({ params: 10 });

    expect(keyedA.data).toBe(2);
    expect(keyedB.data).toBe(11);
  });

  // ------------------------------------------------------------
  test('run() with retryStrategy retries the expected number of times', async () => {
    let attempt = 0;
    void attempt;

    const fn = jest.fn(async () => {
      attempt++;
      throw new Error('fail');
    });

    const duck = new AsyncDuck(fn);

    await duck.run({
      retryStrategy: {
        retries: 2,
        shouldRetry: () => true,
        delayMs: 1,
      },
    });

    // 1 initial try + 2 retries = 3 calls
    expect(fn).toHaveBeenCalledTimes(3);
    expect(duck.isError).toBe(true);
  });

  // ------------------------------------------------------------
  test('runWithRetry stops retrying when shouldRetry returns false', async () => {
    let attempt = 0;
    void attempt;

    const fn = jest.fn(async () => {
      attempt++;
      throw new Error('x');
    });

    const duck = new AsyncDuck(fn);

    await duck.run({
      retryStrategy: {
        retries: 5,
        shouldRetry: () => false,
      },
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------------------------
  test('onSuccess inside retryStrategy still triggers correctly', async () => {
    const fn = jest.fn(async () => 100);
    const onSuccess = jest.fn();

    const duck = new AsyncDuck(fn);

    await duck.run({
      retryStrategy: { retries: 2, shouldRetry: () => true, delayMs: 1 },
      onSuccess,
    });

    expect(onSuccess).toHaveBeenCalledWith(100);
    expect(duck.data).toBe(100);
  });

  // ------------------------------------------------------------
  test('reset() clears all internal state', async () => {
    const duck = new AsyncDuck(async () => 99);

    await duck.run();
    duck.reset();

    expect(duck.data).toBeNull();
    expect(duck.isLoading).toBe(false);
    expect(duck.isRetrying).toBe(false);
    expect(duck.isError).toBe(false);
    expect(duck.hasEverRun).toBe(false);
  });

  // ------------------------------------------------------------
  test('asyncState getter returns full state snapshot', async () => {
    const duck = new AsyncDuck(async n => n + 1);

    await duck.run({ params: 5 });

    expect(duck.asyncState).toEqual({
      isLoading: false,
      isRetrying: false,
      error: null,
      data: 6,
      hasEverRun: true,
      isError: false,
      isSuccess: true,
    });
  });

  // ------------------------------------------------------------
  test('proxy exposes keyed ducks and preserves DUCK_TAG', () => {
    const duck = new AsyncDuck(async () => 1);

    expect(duck.proxy[DUCK_TAG]).toBe(true);
    expect(duck.proxy.randomKey).toBeInstanceOf(AsyncDuck);
  });
});
