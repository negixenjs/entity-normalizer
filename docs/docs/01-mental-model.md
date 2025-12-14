# Mental Model

This document is **mandatory reading** before using Nexigen.

If the mental model described here is violated, the system will still work
at runtime, but its guarantees (consistency, cleanup, predictability) will
no longer hold.

---

## Nexigen in One Sentence

> Nexigen is an entity-normalized domain data engine where **entities own data**
> and **stores only orchestrate behavior**.

This single sentence explains most design decisions in the system.

---

## Problem Nexigen Solves

Modern applications usually have:

- multiple screens rendering the same data
- lists and detail views over the same entities
- partial updates from different endpoints
- pagination with merging
- async flows that update shared data

Without normalization, this leads to:

- duplicated data
- inconsistent UI
- manual cache invalidation
- accidental memory growth

Nexigen enforces **normalization and sharing by construction**.

---

## Core Rules (Non‑Negotiable)

### Rule 1 — Entities Own Data

All domain data lives in **EntitiesStore**.

Stores do not own DTOs.
Collections do not own objects.
Records do not clone state.

Everything references entities.

Breaking this rule leads to:

- duplicated data
- stale UI
- impossible cleanup

---

### Rule 2 — Stores Orchestrate Behavior

Stores are responsible for:

- triggering async operations
- choosing where data goes (record, collection)
- reacting to user intent

Stores are NOT responsible for:

- storing entity fields
- merging data manually
- holding normalized objects

---

### Rule 3 — Lists Store IDs, Not Objects

Collections store:

- order
- pagination metadata
- **entity IDs**

They never store objects.

Objects are always resolved from EntitiesStore.

---

### Rule 4 — Models Never Hold Strong References

Models never reference other models directly.

Relations are resolved lazily via `EntityGetter`.

This guarantees:

- no circular references
- no memory leaks
- safe cascading cleanup

---

## Consequences of This Model

If an entity is updated:

- all lists reflect the update
- all records reflect the update
- all UI using that entity re-renders

If an entity becomes unused:

- it is removed automatically
- no manual cache cleanup required

---

## Comparison with Other Approaches

### Plain MobX

- no normalization
- stores own data
- cleanup is manual

### Redux

- normalized data possible
- heavy boilerplate
- reducers own state

### Query Libraries

- data tied to requests
- poor cross-request sharing
- limited lifecycle control

### Nexigen

- normalization is mandatory
- entities are global
- lifecycle is deterministic

---

## Mental Checklist

Before writing code, ask:

- Where does this data live? (Entity)
- How is it accessed? (Record / Collection)
- Who triggers the flow? (Store)
- What owns lifecycle? (refSource)

If you cannot answer these, revisit this document.
