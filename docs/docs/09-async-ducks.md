# Async Ducks

Async Ducks are the **only supported way** to execute asynchronous logic in Nexigen.

They represent **commands**, not data containers.

---

## What a Duck Is

A duck is:

- an observable async function
- with built-in lifecycle state
- safely integrated with MobX

A duck is NOT:

- a promise wrapper
- a data store
- a cache

---

## Creating a Duck

```ts
login = createDuck(async () => {
  const tokens = await api.login();
  return tokens;
});
```

---

## Duck State

Every duck exposes:

```ts
duck.isLoading;
duck.isRetrying;
duck.error;
duck.data;
duck.hasEverRun;
```

All properties are observable.

---

## Running a Duck

```ts
login.run();
posts.refresh();
```

Running a duck:

- sets isLoading
- resets error
- executes async function
- updates data or error

---

### Refreshing a Duck

```ts
posts.refresh();
```

`refresh()` re-runs the last execution with the same parameters.

It is intended for **explicit revalidation**, such as pull-to-refresh or manual reloads.

Unlike `run()`, refresh may bypass transport-level caching
(depending on the underlying API implementation).

---

## Scoped Ducks

Ducks can have independent state per key.

```ts
fetchPosts[group].run();
```

Each scope has:

- isolated loading
- isolated error
- shared logic

---

## Error Handling

Errors are:

- captured
- stored in duck.error
- never thrown synchronously

This prevents UI crashes.

---

## Anti-Patterns

❌ Using async/await directly in components  
❌ Storing promises in stores  
❌ Using ducks as caches

---

## Guarantees

- predictable async lifecycle
- no race-condition UI states
- testable async flows
