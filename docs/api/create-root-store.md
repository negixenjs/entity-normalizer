# Root Store & Application Bootstrap

The **Root Store** is the top-level entry point of a Nexigen application.

It is responsible for wiring together:
- API layer
- entity schemas
- domain stores
- domain services

There is exactly **one Root Store per application**.

---

## Purpose

The Root Store exists to:

- create a single dependency graph
- initialize all domain stores consistently
- provide a shared normalized entity graph
- act as the application lifecycle boundary

All application state flows **through** the Root Store.

---

## Creating a Root Store

```ts
export const rootStore = createRootStore({
  api: Api,
  schemaMap,
  stores: {
    auth: AuthStore,
    viewers: ViewersStore,
    viewer: ViewerStore,
    posts: PostsStore,
  },
  services: {
    auth: AuthService,
    bootstrap: BootstrapService,
  },
});
```

---

## Configuration Object

### api

```ts
api: Api
```

The API layer used by all stores and services.

Requirements:
- stateless
- deterministic
- safe to reuse

The API is injected, not imported directly.

---

### schemaMap

```ts
schemaMap: Record<string, EntitySchema>
```

A registry of all entity schemas used by the application.

Schemas define:
- entity identity
- relationships
- normalization rules
- model instantiation

All schemas must be registered **before** the app starts.

---

### stores

```ts
stores: Record<string, StoreClass>
```

A map of domain store constructors.

Each store:
- is instantiated once
- receives StoreDeps via constructor
- participates in the shared entity graph

Stores must not import each other directly.

---

### services

```ts
services: Record<string, ServiceClass>
```

Services represent **orchestration and side-effect logic**.

Typical responsibilities:
- app bootstrap flows
- cross-store coordination
- non-reactive workflows

Services:
- can call stores
- can call API
- do not hold observable state

---

## Registering the Root Store

```ts
registerRootStore(rootStore);
```

Registers the Root Store instance globally.

This enables:
- access from React hooks
- debugging and dev tooling
- controlled global visibility

Registration must happen **exactly once**.

---

## Lifecycle

1. Root Store is created
2. Schemas are registered
3. Stores are instantiated
4. Services are instantiated
5. Root Store is registered
6. Application starts

---

## Design Rules

- One Root Store per app
- No dynamic store registration
- No global singletons outside Root Store
- No store-to-store imports

---

## Guarantees

- deterministic initialization order
- explicit dependency graph
- shared entity identity
- predictable application lifecycle
