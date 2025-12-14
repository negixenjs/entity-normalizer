# EntityGetter

`EntityGetter` is a **read-only access interface** to the normalized entity graph.

It is the **only supported way** for models to access other entities.

---

## Purpose

EntityGetter exists to solve a core problem:

> How can models reference other entities **without owning them**?

EntityGetter provides:
- safe access to related entities
- reactive reads
- garbage-collection safety

Models must never access `EntitiesStore` directly.

---

## Mental Model

An `EntityGetter` is a **lens** into the entity graph.

It:
- does not store data
- does not create references
- does not affect lifecycle

It only **reads**.

---

## Public API

### get(entityKey, id)

```ts
get(entityKey: string, id: string | number): Model | undefined
```

Returns:
- model instance if entity exists
- `undefined` if entity is missing or already cleaned up

This method is **reactive**.

---

## Usage in Models

```ts
export class PostModel {
  constructor(dto: PostDto, private get: EntityGetter) {}

  get author() {
    return this.get(ENTITY_KEY.VIEWER, this.viewerId);
  }
}
```

Behavior:
- accessing `author` subscribes to that entity
- updates propagate automatically
- no strong references are created

---

## GC Safety

EntityGetter is **garbage-collector safe** by design.

Important properties:
- does not attach refSources
- does not prevent entity removal
- handles missing entities gracefully

If an entity is removed:
- `get()` returns `undefined`
- no exceptions are thrown
- models remain stable

---

## Reactive Semantics

Reads through `EntityGetter`:
- participate in MobX dependency tracking
- trigger re-computation on entity updates
- do not trigger writes or lifecycle changes

---

## Anti-Patterns

❌ Storing returned models in local state  
❌ Accessing `EntitiesStore` inside models  
❌ Assuming related entities always exist  

---

## Guarantees

- no ownership
- no memory leaks
- safe missing references
- deterministic reactivity
