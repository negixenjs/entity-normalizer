# MultiEntityCollection

`MultiEntityCollection` represents a **set of isolated EntityCollections**
keyed by an arbitrary identifier.

It is designed for cases where the same entity type
must be stored in **multiple independent lists**.

---

## Purpose

MultiEntityCollection is used when:

- lists are grouped by a dynamic key
- each group has its own pagination state
- entities are shared across groups
- UI needs isolated loading / paging per group

Typical examples:
- tabs (active / past / archived)
- filters
- categories
- user-scoped lists

---

## Mental Model

A MultiEntityCollection is a **collection factory**, not a data container.

It:
- does not store items itself
- lazily creates collections per key
- guarantees isolation between groups
- shares the same entity graph

---

## Creation

Multi collections are created via `EntitiesStore`:

```ts
const lists = entities.createMultiCollection<PostDto, PostModel>({
  entityKey: ENTITY_KEY.POST,
  collectionId: REF_SOURCE.POSTS,
  limit: 20,
});
```

---

## Access Pattern

```ts
lists[key]: EntityCollection
```

Accessing a key:
- creates the collection lazily (if missing)
- returns the same instance on subsequent access

```ts
lists.active.set(response);
lists.archived.append(response);
```

---

## Isolation Guarantees

Each key has its own:

- pagination state
- item order
- `hasNoMore` flag
- refSource lifecycle

But all keys share:
- entity identity
- models
- normalization rules

---

## Example Usage

```ts
lists['active'].set(activePosts);
lists['past'].set(pastPosts);
```

Pagination is isolated:

```ts
lists['active'].pageNumber; // 2
lists['past'].pageNumber;   // 1
```

---

## Lifecycle & GC

Each underlying `EntityCollection`:
- attaches its own refSource
- detaches entities independently
- allows orphan cleanup when unused

Removing items from one group
does not affect other groups unless entities become orphaned.

---

## Anti-Patterns

❌ Storing list data outside collections  
❌ Sharing pagination state between keys  
❌ Manually synchronizing groups  

---

## Guarantees

- isolated list state per key
- shared entity identity
- deterministic behavior
- lazy initialization
