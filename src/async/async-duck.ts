import { makeObservable, observable, action } from 'mobx';

import { DUCK_TAG } from './marker';
import { defaultRetryStrategy } from './retry';

import type { RunOptions, RetryStrategy } from './types';

export class AsyncDuck<TParams, TResult> {
  private _isLoading = false;
  private _isRetrying = false;
  private _error: Error | null = null;
  private _data: TResult | null = null;
  private _hasEverRun = false;

  private fn: (params?: TParams) => Promise<TResult>;
  private _keyed = new Map<string, AsyncDuck<TParams, TResult>>();
  private _proxy?: Readonly<this & Record<string, AsyncDuck<TParams, TResult>>>;
  private _pendingPromise: Promise<TResult | undefined> | null = null;

  constructor(fn: (params?: TParams) => Promise<TResult>) {
    this.fn = fn;

    this._proxy = new Proxy(this, {
      get: (target, prop: string) => {
        if (prop in target) {
          return (target as any)[prop];
        }
        return target.getKeyed(prop);
      },
    }) as Readonly<this & Record<string, AsyncDuck<TParams, TResult>>>;

    Object.defineProperty(this._proxy, DUCK_TAG, {
      value: true,
      enumerable: false,
      writable: false,
    });

    makeObservable(this as any, {
      _isLoading: observable,
      _isRetrying: observable,
      _error: observable,
      _data: observable,
      _hasEverRun: observable,

      setLoading: action,
      setSuccess: action,
      setError: action,
      reset: action,
    });
  }

  // -------------------------------------
  // KEYED INSTANCES
  // -------------------------------------
  getKeyed(key: string) {
    if (!this._keyed.has(key)) {
      const duck = new AsyncDuck<TParams, TResult>(this.fn);
      this._keyed.set(key, duck);
    }
    return this._keyed.get(key)!;
  }

  // -------------------------------------
  // INTERNAL MUTATORS
  // -------------------------------------
  private setLoading(isRetry = false) {
    this._isLoading = !isRetry;
    this._isRetrying = isRetry;
    this._error = null;
  }

  private setSuccess(data: TResult, onSuccess?: (d: TResult) => void) {
    this._data = data;
    this._isLoading = false;
    this._isRetrying = false;
    this._hasEverRun = true;
    onSuccess?.(data);
  }

  private setError(err: unknown, onError?: (e: Error) => void) {
    const normalized = err instanceof Error ? err : new Error(String(err));

    this._error = normalized;
    this._isLoading = false;
    this._isRetrying = false;
    this._hasEverRun = true;

    onError?.(normalized);
  }

  reset() {
    this._isLoading = false;
    this._isRetrying = false;
    this._error = null;
    this._data = null;
    this._hasEverRun = false;
    this._pendingPromise = null;
  }

  // -------------------------------------
  // UTILS
  // -------------------------------------
  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // -------------------------------------
  // RETRY ENGINE
  // -------------------------------------
  private async runWithRetry(
    params: TParams | undefined,
    retryStrategy: RetryStrategy,
  ): Promise<TResult> {
    const retry = { ...defaultRetryStrategy, ...retryStrategy };
    const max = retry.retries ?? 0;

    for (let attempt = 1; attempt <= max + 1; attempt++) {
      try {
        return await this.fn(params);
      } catch (error: unknown) {
        const normalized =
          error instanceof Error ? error : new Error(String(error));

        const should = retry.shouldRetry?.(normalized) ?? false;
        const isLast = attempt > max;

        if (!should || isLast) {
          throw normalized;
        }

        this._isRetrying = true;

        const delay = retry.backoff ? retry.delayMs * attempt : retry.delayMs;

        await this.sleep(delay);
      }
    }

    throw new Error('Unexpected retry exit');
  }

  // -------------------------------------
  // PUBLIC RUN
  // -------------------------------------
  async run(
    options?: RunOptions<TParams, TResult>,
  ): Promise<TResult | undefined> {
    if (options?.skip) {
      return;
    }

    if (options?.key) {
      return this.getKeyed(options.key).run({
        ...options,
        key: undefined,
      });
    }

    if (this._pendingPromise) {
      return this._pendingPromise;
    }

    if (this._isLoading || this._isRetrying) {
      return this._pendingPromise!;
    }

    const { params, onSuccess, onError, retryStrategy } = options ?? {};

    const isRetry = !!retryStrategy;
    this.setLoading(isRetry);

    this._pendingPromise = (async () => {
      try {
        const result = retryStrategy
          ? await this.runWithRetry(params, retryStrategy)
          : await this.fn(params);

        this.setSuccess(result, onSuccess);
        return result;
      } catch (err) {
        this.setError(err, onError);
        return undefined;
      } finally {
        this._pendingPromise = null;
      }
    })();

    return this._pendingPromise;
  }

  // -------------------------------------
  // GETTERS
  // -------------------------------------
  get isLoading() {
    return this._isLoading;
  }
  get isRetrying() {
    return this._isRetrying;
  }
  get isError() {
    return !!this._error;
  }
  get isSuccess() {
    return !this._isLoading && !this._error && this._data !== null;
  }
  get data() {
    return this._data;
  }
  get error() {
    return this._error;
  }
  get hasEverRun() {
    return this._hasEverRun;
  }

  get asyncState() {
    return {
      isLoading: this._isLoading,
      isRetrying: this._isRetrying,
      error: this._error,
      data: this._data,
      hasEverRun: this._hasEverRun,
      isError: this.isError,
      isSuccess: this.isSuccess,
    };
  }

  get proxy() {
    return this._proxy;
  }
}
