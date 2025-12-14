# StoreDeps

`StoreDeps` is Nexigen’s **dependency injection container** for domain stores.

It provides controlled access to shared system services
without introducing direct imports or cyclic dependencies.

---

## Purpose

StoreDeps exists to solve three core problems:

1. **Circular dependencies between stores**
2. **Hidden global state**
3. **Untestable store logic**

Instead of importing other stores or singletons directly,
each store declares what it depends on.

---

## Mental Model

Think of StoreDeps as a **constructor contract**.

A store does not ask _where_ dependencies come from —
it only declares _what it needs_.

---

## Constructor Injection

```ts
class PostsStore {
	constructor(
		private deps: StoreDeps<{
			api: typeof Api;
			stores: {
				viewer: ViewerStore;
			};
		}>
	) {}
}
```

All dependencies are provided at store creation time.

---

## Available Dependencies

A StoreDeps instance may contain:

```ts
deps.api; // API layer
deps.stores; // other domain stores
deps.core; // system-level services
```

### deps.stores

Allows calling methods on other stores **without importing them**.

```ts
this.deps.stores.viewer.fetchCurrentViewer.run();
```

This preserves:

- acyclic dependency graph
- explicit coupling
- predictable initialization order

---

### deps.api

Access to the API layer.

```ts
this.deps.api.Posts.getPosts();
```

The API layer is:

- shared
- stateless
- safe to mock

---

### deps.core

Access to core system services.

Common examples:

- `deps.core.entities`

Core services are **infrastructure**, not domain logic.

---

## What StoreDeps Is NOT

StoreDeps is NOT:

- a service locator
- a global singleton
- a runtime registry

Dependencies are fixed at construction time.

---

## Testing Benefits

StoreDeps makes stores easy to test:

```ts
new PostsStore({
	api: mockApi,
	stores: { viewer: mockViewer },
	core: mockCore,
});
```

No globals. No setup hacks.

---

## Anti-Patterns

❌ Mutating dependencies

---

## Guarantees

- explicit dependencies
- no circular imports
- deterministic initialization
- testable store logic
