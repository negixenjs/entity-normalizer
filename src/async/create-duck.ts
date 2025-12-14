import { AsyncDuck } from './async-duck';

import type { PublicAsyncDuck } from './public';

export function createDuck<TFn extends (params: any) => Promise<any>>(fn: TFn) {
  type TParams = TFn extends (params: infer P) => any ? P : never;
  type TResult = TFn extends (...args: any[]) => Promise<infer R> ? R : never;

  const duck = new AsyncDuck<TParams, TResult>(fn);

  return duck.proxy as unknown as Readonly<
    PublicAsyncDuck<TParams, TResult> &
      Record<string, PublicAsyncDuck<TParams, TResult>>
  >;
}
