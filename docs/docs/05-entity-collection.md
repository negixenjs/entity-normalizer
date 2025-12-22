# EntityCollection

EntityCollection represents an **ordered list of entity IDs**.
It is the primary abstraction for lists and pagination.

---

## Purpose

EntityCollection is used for:

- feeds
- search results
- paginated lists
- ordered projections over entities

It does NOT store objects.

---

## Creation

```ts
const viewers = this.deps.core.entities.createCollection<
  ViewerDto, //types
  ViewerModel
>({
  entityKey: ENTITY_KEY.VIEWER,
  collectionId: REF_SOURCE.VIEWERS,
});
```

---

## Mutation API

```
collection.set(data)
collection.append(data)
collection.prepend(data)
collection.add(item)
collection.updateItem(item)
collection.reset()
collection.removeById(id)
collection.removeIds(ids)
collection.resolveById(tempId, realItem)
collection.setHasNoMore(value)
```

## Read API

```
collection.getList
collection.pageNumber
collection.offset
collection.hasNoMore
collection.limit
collection.count
collection.isEmpty
collection.first
collection.last
collection.asArray

```

## Lookup helpers (id based helpers)

```
collection.findById(id)
collection.includes(item)
collection.findIndexById(id)
```

---

## set(items)

- replaces list contents
- registers refSource for all items
- resets pagination state

```ts
posts.set(response);
```

---

## append(items)

- adds items to the end
- preserves order
- updates pagination metadata

```ts
posts.append(response);
```

---

## updateItem(item)

- merges entity into store
- replaces item in list if present
- does NOT change order

Used for detail updates.

---

## Pagination Semantics

### pageNumber

`pageNumber` always represents the **NEXT page to fetch**.

```ts
page = collection.pageNumber;
```

### hasNoMore

`true` when last fetch returned less than `limit`.

---

## Offset-Based APIs

For offset-based APIs:

```
offset = collection.count
```

Never derive offset from pageNumber.

---

## reset()

- removes refSource
- clears list
- entities may be deleted if orphaned

---

## Guarantees

- order preserved
- shared entities
- deterministic cleanup
