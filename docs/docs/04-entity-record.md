# EntityRecord

EntityRecord represents a **stable pointer to a single entity** inside EntitiesStore.
It does not own data and never clones it.

---

## Purpose

EntityRecord is designed for:

- current user (viewer)
- selected item
- detail screens
- singleton domain state

A record answers the question:

> “Which entity is currently active for this concern?”

---

## Creation

```ts
const viewerRecord = this.deps.core.entities.createRecord<
  ViewerDto,
  ViewerModel
>({
  entityKey: ENTITY_KEY.VIEWER,
  recordId: REF_SOURCE.CURRENT_VIEWER,
});
```

- `entityKey` defines entity type
- `recordId` is used as a **refSource**
- `recordId` must be stable and deterministic

---

## API

```ts
record.set(item);
record.update(item);
record.resolve(tempId, realItem);
record.reset();

record.data; // Model | null
record.entityId; // string | null
record.exists;
record.isEmpty;
```

---

## set(dto)

Behavior:

1. DTO is normalized
2. Entity is merged into EntitiesStore
3. refSource is attached
4. record.entityId is updated

```ts
viewerRecord.set(response);
```

If multiple records point to the same entity:

- all records resolve to the same model instance

---

## reset()

Behavior:

1. refSource is detached
2. record.entityId becomes null
3. entity may be removed if orphaned

```ts
viewerRecord.reset();
```

Important:

- record instance remains valid
- accessing record.data returns null

---

## Lifecycle Example

```ts
viewerRecord.set({ id: '1', name: 'Anna' });
viewerRecord.data.name === 'Anna';

viewerRecord.reset();
viewerRecord.data === null;
```

If no other refSources exist:

- entity VIEWER:1 is removed

---

## Edge Cases

### Multiple Records

```ts
const r1 = createRecord(...);
const r2 = createRecord(...);

r1.set({ id: '1' });
r2.set({ id: '1' });
```

- entity exists once
- refSources = { r1, r2 }

Removing one record does NOT delete entity.

---

## Anti-Patterns

❌ Copying record.data into local state
❌ Manually mutating entity fields

---

## Guarantees

- stable identity
- no duplication
- safe cleanup
