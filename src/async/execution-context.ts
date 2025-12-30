import { type ExecutionIntent } from './types';

import type { PublicExecutionContext } from './public';

export class ExecutionContext {
  private stack: ExecutionIntent[] = [];

  async runWith<T>(intent: ExecutionIntent, fn: () => Promise<T>): Promise<T> {
    this.stack.push(intent);
    try {
      return await fn();
    } finally {
      this.stack.pop();
    }
  }

  current(): ExecutionIntent {
    return this.stack[this.stack.length - 1] ?? 'normal';
  }

  is(intent: ExecutionIntent): boolean {
    return this.current() === intent;
  }
}

export function createExecutionContext(): PublicExecutionContext {
  return new ExecutionContext();
}

export const executionAsyncContext: PublicExecutionContext =
  createExecutionContext();
