# EntitiesStore

EntitiesStore is the **core of Nexigen**.

Every other abstraction exists to interact with it safely.

---

## What EntitiesStore Is

EntitiesStore is:

- a global registry of entities
- normalized by ENTITY_KEY
- shared by the entire application

There is exactly **one EntitiesStore per app**.

---

## Responsibilities

EntitiesStore is responsible for:

- storing entities by type + id
- deduplicating entities
- merging incoming data
- tracking refSources
- providing entity access

It is NOT responsible for:

- UI state
- business logic
- async orchestration

---

## Entity Identity

An entity is uniquely identified by:

```
(entityKey, entityId)
```

If two API responses contain the same entity:

- they resolve to the same model instance

This identity stability is critical.

---

## Core API

### merge

```ts
entities.merge(payload, refSource?)
```

Merges normalized payload into the store.

Behavior:

- existing entities are updated
- new entities are created
- meta timestamps are updated
- refSource is registered

### getEntity

```ts
entities.getEntity(entityKey, id);
```

Returns:

- model instance if exists
- null if missing

This call is reactive.

---

## RefSource Tracking

Every entity tracks **why it exists**.

Examples of refSources:

- collection id
- record id

If all refSources are removed:

- the entity becomes orphaned
- it is removed automatically

---

## Merge Semantics

- last write wins per field
- undefined fields are ignored
- models are not replaced
- object identity is preserved

This ensures UI stability.

## Internal Merge Flow (Simplified)

> ⚠️ This example illustrates **internal Nexigen behavior**.
> Application code must **not** call `entities.merge` directly.

Internally, Nexigen performs a merge similar to the following:

```ts
const response = await api.getPosts();
entities.merge(response, REF_SOURCE.POSTS);
```

---

## Testing Implications

Because EntitiesStore is deterministic:

- it can be tested in isolation
- merge behavior is predictable
- edge cases are reproducible

This is why most Nexigen tests target EntitiesStore.
