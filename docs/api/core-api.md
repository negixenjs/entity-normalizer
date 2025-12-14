# Core API

The **Core API** is the lowest public layer of Nexigen.
It represents the **infrastructure surface** that domain stores,
services, and React hooks are allowed to interact with.

Core API is:
- public
- stable
- intentionally limited

It is **not** a domain layer and must not contain business logic.

---

## Purpose

Core API exists to:

- expose normalized entity access
- manage store snapshots and lifecycle
- provide deterministic application state control

Every store and service receives Core API via `StoreDeps`.

---

## Access Model

Core API is available through:

- `StoreDeps` in stores and services
- `useCore()` hook in React

```ts
const core = useCore();
```

---

## Core.Entities

The `core.entities` namespace provides access to the normalized entity graph.

It is the **only allowed gateway** for entity creation,
normalization, and retrieval at the infrastructure level.

---

### Factories

#### createRecord

```ts
core.entities.createRecord<TDto, TModel>({
  entityKey,
  recordId,
});
```

Creates an `EntityRecord`.

Use cases:
- current viewer
- selected entity
- singleton domain state

---

#### createCollection

```ts
core.entities.createCollection<TDto, TModel>({
  entityKey,
  collectionId,
  limit,
  reversed,
  hasNoMore,
});
```

Creates a single `EntityCollection`.

Use cases:
- lists
- pagination
- infinite scroll

---

#### createMultiCollection

```ts
core.entities.createMultiCollection<TDto, TModel>({
  entityKey,
  collectionId,
  limit,
  reversed,
  hasNoMore,
});
```

Creates a `MultiEntityCollection`
(keyed collections with isolated state).

---

### Normalization

#### process

```ts
core.entities.process({
  data,
  entityKey,
  sourceRefId,
  isCollection,
});
```

Normalizes raw DTOs into the entity graph.

Behavior:
- extracts entity ids
- merges entities
- attaches refSources

This method is used internally by:
- collections
- records
- async flows

---

#### hydrate

```ts
core.entities.hydrate(snapshot);
```

Hydrates entities from a snapshot.

Used during:
- application bootstrap
- state restoration

---

### Entity Getters

#### get

```ts
core.entities.get(entityKey, id);
```

Returns a single entity model or `undefined`.

Reactive and GC-safe.

---

#### getAll

```ts
core.entities.getAll(entityKey);
```

Returns all entities of a given type.

---

#### getCount

```ts
core.entities.getCount(entityKey);
```

Returns the number of entities for a given type.

---

#### getSnapshot

```ts
core.entities.getSnapshot();
```

Returns a serializable snapshot of all entities.

---

#### getSchema

```ts
core.entities.getSchema(entityKey);
```

Returns the registered schema for an entity type.

Primarily used by internal mechanisms and advanced tooling.

---

## Core.Stores

The `core.stores` namespace controls **store-level snapshots**
and reset operations.

---

#### getSnapshot

```ts
core.stores.getSnapshot();
```

Returns snapshots of all stores.

---

#### getSnapshotByKey

```ts
core.stores.getSnapshotByKey(key);
```

Returns snapshot of a single store.

---

#### applySnapshot

```ts
core.stores.applySnapshot(snapshot);
```

Applies snapshots to all stores.

---

#### applySnapshotByKey

```ts
core.stores.applySnapshotByKey(key, snapshot);
```

Applies snapshot to a single store.

---

#### resetAll

```ts
core.stores.resetAll();
```

Resets all stores to initial state.

---

#### resetByKey

```ts
core.stores.resetByKey(key);
```

Resets a single store.

---

## Core.Lifecycle

The `core.lifecycle` namespace represents
application-level lifecycle state.

---

#### isInitialized

```ts
core.lifecycle.isInitialized;
```

Indicates whether application initialization is complete.

---

#### setInitialized

```ts
core.lifecycle.setInitialized(true);
```

Marks application as initialized.

Commonly used during bootstrap flows.

---

## Design Rules

- Core API must not contain business logic
- Domain stores must not bypass Core API
- Core API is shared and singleton per Root Store

---

## Guarantees

- deterministic behavior
- explicit boundaries
- safe infrastructure access
- predictable lifecycle
