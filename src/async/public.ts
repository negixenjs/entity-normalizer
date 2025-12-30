import type { AxiosError, ExecutionIntent } from './types';

export interface RetryStrategy {
  retries: number;
  delayMs: number;
  backoff?: boolean;
  shouldRetry?: (error: AxiosError | Error) => boolean;
}

export type RunOptions<TParams, TResult> = {
  params?: TParams;
  onSuccess?: (data: TResult) => void;
  onError?: (err: Error) => void;
  key?: string;
  skip?: boolean;
  retryStrategy?: RetryStrategy;
};

export interface PublicExecutionContext {
  runWith<T>(intent: ExecutionIntent, fn: () => Promise<T>): Promise<T>;

  current(): ExecutionIntent;
  is(intent: ExecutionIntent): boolean;
}

export interface PublicAsyncDuck<TParams, TResult> {
  run(options?: RunOptions<TParams, TResult>): Promise<TResult | undefined>;
  refresh(): Promise<TResult | undefined>;

  readonly isLoading: boolean;
  readonly isRetrying: boolean;
  readonly isError: boolean;
  readonly isSuccess: boolean;
  readonly hasEverRun: boolean;

  readonly data: TResult | null;
  readonly error: Error | null;

  readonly asyncState: {
    isLoading: boolean;
    isRetrying: boolean;
    isError: boolean;
    isSuccess: boolean;
    hasEverRun: boolean;
    data: TResult | null;
    error: Error | null;
  };
}
