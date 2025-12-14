
# Schemas & Normalization

Schemas define how raw API responses are transformed into a normalized entity graph.

---

## Purpose of Schemas

Schemas exist to:
- flatten nested API responses
- deduplicate entities
- define relationships
- map DTOs to Models

Schemas do NOT:
- fetch data
- store state
- contain business logic

---

## createEntitySchema

```ts
const postSchema = createEntitySchema<PostDto, PostModel>(
  ENTITY_KEY.POST,
  {
    viewer: viewerSchema,
    viewers: [viewerSchema],
  },
  {
    model: PostModel,
  },
);
```

---

## Relationship Types

### One-to-One

```ts
viewer: viewerSchema
```

Produces:
```ts
viewerId: string
```

---

### One-to-Many

```ts
viewers: [viewerSchema]
```

Produces:
```ts
viewersId: string[]
```

---

## Normalization Rules

- nested objects are replaced by ids
- entities are deduplicated globally
- missing nested data is skipped safely

---

## Partial Data

Schemas tolerate partial payloads.

If a nested entity is missing:
- normalization continues
- no error is thrown

This allows:
- lightweight list payloads
- heavy detail payloads

---

## Anti-Patterns

❌ Storing nested objects in models  
❌ Manual flattening  
❌ Coupling schemas to API endpoints  

---

## Guarantees

- deterministic normalization
- stable entity identity
- safe merging of partial data
