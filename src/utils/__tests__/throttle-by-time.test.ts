import { throttleByTime } from '../throttle-by-time';

jest.useFakeTimers();

describe('throttleByTime', () => {
  it('runs immediately on first call', () => {
    const fn = jest.fn();
    const throttled = throttleByTime(fn, 1000);

    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('ignores calls within the interval', () => {
    const fn = jest.fn();
    const throttled = throttleByTime(fn, 1000);

    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('runs again after interval passes', () => {
    const fn = jest.fn();
    const throttled = throttleByTime(fn, 1000);

    throttled();
    jest.advanceTimersByTime(1000);
    throttled();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('handles rapid successive calls safely', () => {
    const fn = jest.fn();
    const throttled = throttleByTime(fn, 500);

    throttled();
    jest.advanceTimersByTime(100);
    throttled(); // ignored
    jest.advanceTimersByTime(100);
    throttled(); // ignored
    jest.advanceTimersByTime(305);
    throttled(); // now allowed

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('forwards arguments correctly', () => {
    const fn = jest.fn();
    const throttled = throttleByTime(fn, 1000);

    throttled('a', 123);

    expect(fn).toHaveBeenCalledWith('a', 123);
  });

  it('keeps internal lastRun isolated between different instances', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();

    const throttled1 = throttleByTime(fn1, 1000);
    const throttled2 = throttleByTime(fn2, 1000);

    throttled1();
    throttled2();

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
  });
});
