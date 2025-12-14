# Entity Schemas

Entity Schemas define **how raw API data is transformed into a normalized entity graph**.

A schema is the **single source of truth** for:
- entity identity
- relationships
- normalization rules
- model instantiation

Every entity type in Nexigen **must have exactly one schema**.

---

## Purpose

An Entity Schema answers three fundamental questions:

1. **How is this entity identified?**
2. **How does it reference other entities?**
3. **Which model represents it at runtime?**

Schemas are used by:
- normalization engine
- entity collections
- entity records
- garbage collection graph
- entity hydration

---

## Creating a Schema

```ts
const postSchema = createEntitySchema<PostDto, PostModel>(
  ENTITY_KEY.POST,
  {
    viewer: viewerSchema,
    viewers: [viewerSchema],
  },
  {
    model: PostModel,
  }
);
```

---

## Parameters

### entityKey

```ts
entityKey: string
```

A globally unique identifier for the entity type.

Examples:
- ENTITY_KEY.POST
- ENTITY_KEY.VIEWER

---

### relations

```ts
relations: Record<string, EntitySchema | EntitySchema[]>
```

Defines structural relationships between entities.

Supported forms:

```ts
viewer: viewerSchema
viewers: [viewerSchema]
```

Behavior:
- nested objects are normalized
- references are replaced with xxxId / xxxId[]
- related entities are merged into their own buckets

---

### options.model

```ts
model: new (dto, entityGetter) => Model
```

Defines the runtime representation of the entity.

Models:
- are instantiated once per entity
- preserve identity across updates
- expose derived logic only

---

## Normalization Example

```json
{
  "id": "1",
  "title": "Post",
  "viewer": { "id": "10", "name": "Anna" }
}
```

Produces:

```ts
posts: {
  "1": { id: "1", title: "Post", viewerId: "10" }
}
viewers: {
  "10": { id: "10", name: "Anna" }
}
```

---

## Guarantees

- stable entity identity
- consistent normalization
- no model duplication
- safe missing relations

---

## Anti-Patterns

❌ Multiple schemas per entity  
❌ Business logic in schemas  
❌ Mutable schema definitions  

---

## Mental Model

A schema is a blueprint, not a container.
