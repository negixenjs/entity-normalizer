# Real-World Flows

This document demonstrates **real application flows** using Nexigen.

---

## Authentication Flow

```ts
login = createDuck(async () => {
  const tokens = await api.login();
  await Tokens.save(tokens);
  await viewerStore.fetchCurrentViewer.run();
  viewerStore.setIsLoggedIn(true);
});
```

Effects:

- entities merged
- viewer record updated
- UI reacts automatically

---

## Feed Pagination Flow

```ts
fetchMorePosts = createDuck(async ({ group }) => {
  if (lists[group].hasNoMore) return;
  const res = await api.getPosts({
    page: lists[group].pageNumber,
    limit: lists[group].limit,
  });
  lists[group].append(res);
});
```

---

## Detail → List Sync

```ts
updatePost = createDuck(async ({ id }) => {
  const post = await api.getPost(id);
  lists['feed'].updateItem(post);
});
```

Updating detail automatically updates list views.

---

## Why This Works

- shared entity identity
- normalized storage
- reactive reads

No manual sync logic is required.
