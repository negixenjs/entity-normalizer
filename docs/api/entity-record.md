# EntityRecord

`EntityRecord` represents a **stable pointer to a single entity**
inside the normalized entity graph.

It does not own data and never clones it.

---

## Purpose

EntityRecord is designed for **singleton-like domain state**, such as:

- current viewer
- selected item
- focused detail entity
- active context entity

It answers the question:

> “Which entity is currently selected for this concern?”

---

## Mental Model

An EntityRecord is a **reference**, not storage.

- it stores only an entity id
- it resolves the model dynamically
- it does not extend entity lifetime beyond its refSource

---

## Creating a Record

```ts
const viewerRecord = entities.createRecord<ViewerDto, ViewerModel>({
  entityKey: ENTITY_KEY.VIEWER,
  recordId: REF_SOURCE.CURRENT_VIEWER,
});
```

- `entityKey` defines entity type
- `recordId` is used as a **refSource**
- `recordId` must be stable and deterministic

---

## Public API

### data

```ts
record.data: Model | undefined
```

Returns:

- model instance if entity exists
- `undefined` if record is empty or entity was removed

This property is **reactive**.

---

### entityId

```ts
record.entityId: string | number | null
```

Returns the current entity id, if any.

---

### exists

```ts
record.exists: boolean
```

Indicates whether the record currently points to a valid entity.

---

### isEmpty

```ts
record.isEmpty: boolean
```

True when no entity is selected.

---

## Mutations

### set(dto)

```ts
record.set(dto);
```

Behavior:

- normalizes incoming DTO
- merges entity into `EntitiesStore`
- attaches record refSource
- updates `entityId`

If multiple records reference the same entity:

- the model instance is shared

---

### update(dto)

```ts
record.update(dto);
```

Updates entity data **without changing the record binding**.

---

### resolveById(tempId: string | number, real: T)

Resolves an optimistic entity in the collection.

```ts
record.resolve(tempId, realEntity);
```

---

### reset()

```ts
record.reset();
```

Behavior:

- detaches record refSource
- clears `entityId`
- entity may be removed if orphaned

The record instance itself remains valid.

---

## Lifecycle Example

```ts
record.set({ id: '1', name: 'Anna' });
record.data?.name === 'Anna';

record.reset();
record.data === undefined;
```

---

## GC Safety

EntityRecord participates in garbage collection via refSources.

- records keep entities alive while active
- removing a record allows cleanup
- no memory leaks are possible

---

## Anti-Patterns

❌ Storing DTOs directly in stores  
❌ Copying `record.data` into local state  
❌ Mutating entity fields outside models

---

## Guarantees

- stable identity
- no duplicated models
- safe cleanup
- deterministic behavior
