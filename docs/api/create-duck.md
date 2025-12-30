# Async Ducks

Async Ducks are Nexigen’s **command abstraction** for asynchronous logic.

They represent **commands**, not data containers, and expose
a deterministic, observable execution lifecycle.

Async Ducks are the **only supported way** to execute async logic
inside Nexigen stores.

---

## Creating a Duck

```ts
login = createDuck(async params => {
  return api.login(params);
});
```

`createDuck` accepts a single async function
and returns an observable async command.

---

## Running a Duck

```ts
duck.run(options?)
```

`run()` executes the async command.

It **never throws synchronously**.
All errors are captured and exposed via observable state.

---

## Run Options (Public API)

```ts
duck.run({
  params?: TParams;
  onSuccess?: (data: TResult) => void;
  onError?: (error: Error) => void;
  retryStrategy?: RetryStrategy;
});
```

---

## Retry Strategy

Async Ducks support **optional retry behavior**.

Retry is **opt-in** and configured per execution.

```ts
duck.run({
  retryStrategy: {
    retries: 3,
    delayMs: 500,
    backoff: true,
    shouldRetry: error => error.message.includes('Network'),
  },
});
```

### Retry Behavior

- retries are executed sequentially
- retry delay can be constant or exponential
- `isRetrying` becomes `true` during retry attempts
- retry failures are surfaced via `duck.error`

Retry logic is **fully observable** and safe for UI binding.

---

## onSuccess

Called **after successful execution** and state update.

```ts
duck.run({
  onSuccess: data => {
    console.log('Success', data);
  },
});
```

---

## onError

Called when execution fails (after retries, if configured).

```ts
duck.run({
  onError: error => {
    console.error(error);
  },
});
```

Callbacks are **side-effect hooks**, not control flow.

---

## Observable State (Public Contract)

Each duck exposes the following observable state:

```ts
duck.isLoading: boolean
duck.isRetrying: boolean
duck.isError: boolean
duck.isSuccess: boolean

duck.data: TResult | null
duck.error: Error | null
duck.hasEverRun: boolean
```

---

## Aggregated State

```ts
duck.asyncState;
```

Returns a stable snapshot:

```ts
{
  isLoading: boolean;
  isRetrying: boolean;
  error: Error | null;
  data: TResult | null;
  hasEverRun: boolean;
  isError: boolean;
  isSuccess: boolean;
}
```

---

## Resetting a Duck

```ts
duck.reset();
```

Resets:

- loading flags
- error
- data
- execution history

Does **not** cancel an in-flight request.

---

## Refreshing a Duck

```ts
duck.refresh();
```

Re-executes the duck using the **last run parameters**.

`refresh()` is intended for **explicit revalidation** scenarios such as:

- pull-to-refresh
- reconnect
- background sync
- manual data revalidation

### Refresh Behavior

- does nothing if the duck has never run
- does not require passing params again
- preserves the same observable lifecycle as `run`
- bypasses transport-level cache when supported
- does **not** change retry configuration

`refresh()` is explicit by design and is **not** an alias for `run()`.

---

## Side Effects

Side effects should be implemented using:

- `onSuccess`
- `onError`
- reactions to observable state

Avoid imperative async control flow.

---

## Anti-Patterns

❌ Using `async/await` directly in components  
❌ Treating ducks as data stores  
❌ Relying on thrown errors  
❌ Mutating store state outside actions

---

## Guarantees

- deterministic async lifecycle
- observable, testable behavior
- retry safety without race conditions
