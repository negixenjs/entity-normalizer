# Nexigen

**Entity-Normalized State Management for MobX**

Nexigen is an open-source, domain-level state management engine built on top of MobX.
It provides a strict **entity-first architecture** for managing normalized data,
relationships, collections, and async workflows in complex applications.

Nexigen is designed for applications where:

- data has long lifecycles
- entities are shared across multiple screens
- consistency and identity stability matter
- simple stores are no longer enough

> Nexigen brings backend-style data modeling and lifecycle guarantees to the client.

---

## Why Nexigen Exists

Most client-side state solutions treat data as:

- flat objects
- screen-scoped state
- short-lived responses

This approach breaks down when:

- the same entity appears in multiple places
- pagination, details, and updates overlap
- memory usage grows over time
- async logic becomes tangled with UI state

Nexigen solves this by treating **entities as first-class citizens**.

---

## Core Goals

- **Stable Entity Identity**
  One entity = one model instance across the entire app.

- **Normalized Graph**
  All data lives in a single normalized entity graph.

- **Deterministic Lifecycle**
  Entities exist only while referenced.

- **Explicit Async Commands**
  Async logic is modeled as commands, not state.

- **MobX-native Reactivity**
  No selectors, no memoization, no manual wiring.

---

## Mental Model (Read First)

Before using Nexigen, you must understand its mental model.

📘 **[Mental Model](docs/docs/01-mental-model.md)**
Defines the rules and invariants of the system. Mandatory reading.

---

## Architecture Overview

Nexigen is composed of several orthogonal layers:

- Entity Schemas
- Normalized Entity Store
- Records & Collections
- Async Ducks
- Dependency Injection (StoreDeps)
- React Hooks

📘 **[Architecture Overview](docs/docs/02-architecture-overview.md)**

---

## Installation

```bash
pnpm add @nexigen/entity-normalizer mobx mobx-react-lite
```

or

```bash
npm install @nexigen/entity-normalizer mobx mobx-react-lite
```

or

```bash
yarn add @nexigen/entity-normalizer mobx mobx-react-lite
```

---

## Application Setup

### 1. Create Entity Keys

```ts
export const ENTITY_KEY = {
	VIEWER: 'viewers',
	POST: 'posts',
} as const;
```

---

### 2. Define Schemas

```ts
export const viewerSchema = createEntitySchema(
	ENTITY_KEY.VIEWER,
	{},
	{ model: ViewerModel }
);
```

```ts
export const postSchema = createEntitySchema(
	ENTITY_KEY.POST,
	{
		viewer: viewerSchema,
		viewers: [viewerSchema],
	},
	{ model: PostModel }
);
```

---

### 3. Register Schema Map

```ts
export const schemaMap = {
	[ENTITY_KEY.VIEWER]: viewerSchema,
	[ENTITY_KEY.POST]: postSchema,
};
```

---

## Models

Models wrap DTOs and define behavior.
They never own related entities directly.

```ts
export class PostModel {
	constructor(dto, get) {
		this.id = dto.id;
		this.viewerId = dto.viewerId;
		this.title = dto.title;
		makeAutoObservable(this);
	}

	get viewer() {
		return this.get(ENTITY_KEY.VIEWER, this.viewerId);
	}
}
```

---

## Stores

Stores orchestrate behavior.
They never store entity data directly.

```ts
export class PostsStore {
	lists;

	constructor(deps) {
		this.lists = deps.core.entities.createMultiCollection({
			entityKey: ENTITY_KEY.POST,
			collectionId: 'posts',
			limit: 20,
		});

		makeAutoObservable(this);
	}

	fetchPosts = createDuck(async ({ group }) => {
		const res = await deps.api.Posts.getPosts({ group });
		this.lists[group].set(res);
	});
}
```

---

## Root Store Initialization

```ts
export const rootStore = createRootStore({
	api: Api,
	schemaMap,
	stores: {
		posts: PostsStore,
		viewer: ViewerStore,
	},
	services: {
		bootstrap: BootstrapService,
	},
});
```

```ts
registerRootStore(rootStore);
```

---

## React Integration

```ts
export const { useStores, useServices, useCore } =
	createStoreHooks<typeof rootStore>();
```

```tsx
const PostsScreen = observer(() => {
	const { posts } = useStores();

	useEffect(() => {
		posts.fetchPosts.run({ group: 'active' });
	}, []);

	return <List data={posts.lists.active.getList} />;
});
```

---

## Documentation Index

- EntitiesStore
- EntityRecord
- EntityCollection
- MultiEntityCollection
- Schemas
- Models
- Async Ducks
- StoreDeps
- Core API
- React Hooks
- Anti-patterns
- Testing

---

## Status

- Actively developed.
- Core logic is thoroughly covered by tests.

---

## License

MIT
