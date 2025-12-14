# React Integration

Nexigen integrates with React via standard MobX patterns.

---

## observer

```ts
export default observer(Component);
```

---

## Access Pattern

Components should:

- read models directly
- avoid destructuring entities
- rely on MobX tracking

---

## Correct Usage

```tsx
const PostItem = observer(({ post }) => <Text>{post.title}</Text>);
```

---

## Anti-Patterns

❌ Copying model fields into local state
❌ Using useMemo to cache entities

---

## Guarantees

- minimal re-renders
- precise dependency tracking
