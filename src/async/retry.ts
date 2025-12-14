import type { AxiosError, RetryStrategy } from './types';

export const shouldRetryDefault = (error: AxiosError | Error): boolean => {
  // AbortController → no retry
  if (error.message === 'canceled') {
    return false;
  }

  const axiosErr = error as AxiosError;

  // Network-level issues
  if (axiosErr.code === 'ERR_NETWORK') {
    return true;
  }
  if (axiosErr.code === 'ECONNABORTED') {
    return true;
  }

  // No response at all → server unreachable
  if (!axiosErr.response) {
    return true;
  }

  const status = axiosErr.response.status;

  if (status >= 500) {
    return true;
  } // 5xx
  if (status === 429) {
    return true;
  } // rate limit
  if (status === 401) {
    return false;
  } // handled separately via interceptor

  return false;
};

export const defaultRetryStrategy: RetryStrategy = {
  retries: 2,
  delayMs: 300,
  backoff: true,
  shouldRetry: shouldRetryDefault,
};
