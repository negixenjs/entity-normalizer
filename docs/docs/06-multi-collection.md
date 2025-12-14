# MultiEntityCollection

MultiEntityCollection manages **multiple isolated collections**
of the same entity type.

---

## Purpose

Used when:

- same entity appears in multiple groups
- tabs or filters are required
- pagination differs per group

---

## Creation

```ts
const lists = this.deps.core.entities.createMultiCollection({
	entityKey: ENTITY_KEY.POST,
	collectionId: REF_SOURCE.POSTS,
	limit: 20,
});
```

---

## Usage

```ts
lists['active'].set(response);
lists['past'].append(response);
```

Each key returns an independent EntityCollection.

---

## Isolation Rules

- list state is isolated per key
- pagination is isolated
- refSources are tracked per list

---

## Entity Sharing

Entities are shared globally.

Updating an entity in one group:

- updates it in all groups

---

## reset(key)

```ts
lists[key].reset();
```

- removes only that group's refSource
- does not affect other groups

---

## Guarantees

- no cross-group pollution
- deterministic cleanup
