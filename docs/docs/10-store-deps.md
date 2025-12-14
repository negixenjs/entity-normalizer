# StoreDeps

StoreDeps is Nexigen's dependency injection mechanism.

---

## Why StoreDeps Exists

Without StoreDeps:

- stores import each other
- circular dependencies appear
- testing becomes painful

StoreDeps solves this structurally.

---

## Constructor Injection

```ts
class PostsStore {
	constructor(
		private deps: StoreDeps<{
			api: typeof Api;
			stores: { viewer: ViewerStore };
		}>
	) {}
}
```

---

## Available Dependencies

- deps.api
- deps.stores
- deps.core.entities

No store imports another store directly.

Stores may interact with other stores by calling their public methods
via `deps.stores`. This preserves runtime collaboration
while avoiding compile-time coupling and circular imports.

---

## Testing Benefits

- stores can be instantiated in isolation
- dependencies can be mocked
- no global state required

---

## Anti-Patterns

❌ Importing other stores directly
❌ Reading global singletons

---

## Guarantees

- acyclic dependency graph
- predictable initialization
