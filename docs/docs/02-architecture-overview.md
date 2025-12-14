# Architecture Overview

This document explains **how Nexigen is structured internally**
and how data flows through the system.

---

## High-Level Flow

```
API Response
   ↓
Schema Normalization
   ↓
Records / Collections register refSources
   ↓
EntitiesStore.merge()
   ↓
MobX reactive graph updates UI
```

---

## Core Building Blocks

### EntitiesStore

Global normalized cache.
Owns all entity instances.

### EntityRecord

Pointer to a single entity.
Used for detail-like state.

### EntityCollection

Ordered list of entity IDs.
Used for lists and pagination.

### MultiEntityCollection

Multiple isolated collections over the same entity type.

### Duck

Observable async command.

---

## Dependency Direction

Dependencies always point **inward**:

```
Store → EntitiesStore
Store → API
Model → EntityGetter → EntitiesStore
```

Never:

```
EntitiesStore → Store
Model → Store
Collection → Store
```

This ensures:

- no cycles
- predictable ownership
- easy testing

---

## Why There Is One EntitiesStore

Having a single entity cache ensures:

- identity stability
- cross-screen consistency
- trivial deduplication
- deterministic cleanup

Multiple entity caches reintroduce duplication problems.

---

## Why Collections Are Separate from Entities

Entities represent **what exists**.
Collections represent **how it is viewed**.

This separation allows:

- multiple views over same data
- independent pagination
- safe resets without data loss

---

## Architectural Guarantees

If used correctly, Nexigen guarantees:

- no duplicated entities
- consistent updates everywhere
- bounded memory (with refSource cleanup)
- predictable async behavior
