# EntityCollection

`EntityCollection` represents a **reactive, normalized list of entities**
backed by the global `EntitiesStore`.

Internally, a collection stores **only entity ids** and resolves
models lazily on access.

---

## Purpose

EntityCollection is designed for:

- paginated lists
- infinite scroll
- grouped entity lists
- real-time updates

It answers the question:

> “Which entities belong to this list, and in what order?”

---

## Mutation API

### set(items: T[])

Replaces the entire collection with new items.

Behavior:

- normalizes incoming DTOs
- replaces internal id list
- resets pagination state
- updates `hasNoMore`

```ts
collection.set(response);
```

---

### append(items: T[])

Appends items to the end of the collection.

Typical use:

- pagination
- infinite scroll

```ts
collection.append(response);
```

---

### prepend(items: T[])

Prepends items to the beginning of the collection.

Typical use:

- real-time updates
- optimistic inserts

```ts
collection.prepend([item]);
```

---

### add(item: T)

Adds a single item to the collection.

Insertion position depends on the `reversed` flag.

```ts
collection.add(item);
```

---

### updateItem(item: T)

Updates an existing entity **without changing collection order**.

```ts
collection.updateItem(item);
```

---

### removeById(id: string | number)

Removes a single entity from the collection by id.

Behavior:

- removes id from collection
- detaches collection refSource
- triggers cascade cleanup if orphaned

```ts
collection.removeById(id);
```

---

### removeIds(ids: Array<string | number>)

Removes multiple entities at once.

```ts
collection.removeIds([id1, id2]);
```

---

### resolveById(tempId: string | number, real: T)

Resolves an optimistic entity in the collection.

```ts
collection.resolveById(tempId, realEntity);
```

---

### reset(options?)

Clears the collection.

Behavior:

- detaches all collection refSources
- resets pagination flags

```ts
collection.reset();
```

---

### setHasNoMore(value: boolean)

Manually controls pagination end state.

```ts
collection.setHasNoMore(true);
```

---

## Read API

### getList

Returns the resolved list of models.

```ts
const posts = collection.getList;
```

This getter is reactive.

---

### pageNumber

Returns the next page number based on `limit`.

```ts
collection.pageNumber;
```

---

### offset

Returns the current item count.

```ts
collection.offset;
```

---

### hasNoMore

Indicates whether pagination has reached the end.

```ts
collection.hasNoMore;
```

---

### limit

The page size for pagination.

```ts
collection.limit;
```

---

## Utility Getters

```ts
collection.count;
collection.isEmpty;
collection.first;
collection.last;
collection.asArray;
```

---

## Lookup Helpers

```ts
collection.findById(id);
collection.findIndexById(id);
collection.includes(item);
collection.byIndex(index);
```

---

## Guarantees

- stable entity identity
- no duplicated models
- deterministic pagination behavior
- safe orphan cleanup
