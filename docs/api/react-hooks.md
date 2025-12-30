# React Hooks Integration

Nexigen provides a **typed React integration layer**
built on top of the Root Store.

Hooks are generated once and provide:

- type-safe access to stores and services
- full IDE autocompletion
- MobX reactivity out of the box

---

## Creating Hooks

Hooks are created from the Root Store type.

```ts
import { rootStore } from '@core/state/rootStore';
import { createStoreHooks } from '@nexigen/entity-normalizer';

export const { useStores, useServices, useStore, useService, useCore } =
  createStoreHooks<typeof rootStore>();
```

This step should be done **once** in the application.

---

## Available Hooks

### useStores

```ts
const stores = useStores();
```

Returns all domain stores, fully typed.

```ts
const { posts, viewer, auth } = useStores();
```

---

### useStore

```ts
const posts = useStore('posts');
```

Access a single store by key.

---

### useServices

```ts
const services = useServices();
```

Returns all registered services.

---

### useService

```ts
const authService = useService('auth');
```

Access a single service.

---

### useCore

```ts
const core = useCore();
```

Provides access to core infrastructure (entities, notifications, etc).

---

## React Usage Example

```ts
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@core/state';

const GROUPS = {
  ACTIVE: 'active',
};

const ExploreContainer = () => {
  const {
    posts: {
      fetchPosts: { [GROUPS.ACTIVE]: fetchPostsActive },
      lists: {
        [GROUPS.ACTIVE]: { getList: activeList },
      },
      fetchMorePosts: { [GROUPS.ACTIVE]: fetchMorePostsActive },
    },
  } = useStores();

  useEffect(() => {
    fetchPostsActive.run({ params: { group: GROUPS.ACTIVE } });
  }, []);

  return (
    <Explore
      list={activeList}
      isLoading={fetchPostsActive.isLoading}
      isLoadingMore={fetchMorePostsActive.isLoading}
      onRefresh={fetchPostsActive.refresh}
      }
      getMorePosts={() =>
        fetchMorePostsActive.run({
          params: { group: GROUPS.ACTIVE },
        })
      }
    />
  );
};

export default observer(ExploreContainer);
```

---

## Reactivity Model

- Hooks return MobX-backed objects
- Components must be wrapped with `observer`
- Reading observable fields creates subscriptions
- Updates propagate automatically

No selectors or memoization are required.

---

## Type Safety

All hooks are:

- fully inferred from `rootStore`
- strongly typed
- IDE-friendly

Refactoring store keys or APIs
will surface type errors immediately.

---

## Anti-Patterns

❌ Using hooks outside React components  
❌ Mutating store state outside actions  
❌ Using hooks without `observer`

---

## Guarantees

- zero boilerplate
- predictable reactivity
- full type inference
- safe store access
