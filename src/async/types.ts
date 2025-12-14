export interface AxiosError<T = unknown> extends Error {
  isAxiosError?: boolean;

  response?: {
    status: number;
    data?: T;
    headers?: unknown;
  };

  request?: unknown;

  code?: string;
}

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
