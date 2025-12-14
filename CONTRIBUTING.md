# Contributing to Nexigen

Thanks for your interest in contributing to **Nexigen** ❤️
This project is a **core-level state management engine**, so we value
correctness, consistency, and architectural discipline over speed.

Please read this document carefully before opening an issue or PR.

---

## Philosophy

Nexigen is built around strict invariants:

- entity-first architecture
- normalized graph
- stable identity
- explicit lifecycle
- zero UI coupling

Any contribution **must preserve these principles**.

If you're unsure — open an issue first.

---

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/<your-username>/entity-normalizer.git
cd entity-normalizer
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Run checks

```bash
yarn lint
yarn typecheck
yarn test
```

All checks **must pass** before submitting a PR.

---

## Project Structure

```
src/
 ├─ async/        # Async commands (Ducks)
 ├─ entities/     # Records, collections, schemas (entity graph)
 ├─ root/         # RootStore & Core API
 ├─ di/           # Dependency injection & store registration
 ├─ utils/        # Pure utilities (no side effects)
 ├─ constants/    # Shared constants & internal flags
 ├─ create/       # Internal factories (store)

```

Rules:

- No UI dependencies (React / React Native are forbidden)
- No side effects at module level
- No implicit async flows

---

## Code Style

- ESLint + Prettier are mandatory
- No unused exports
- Explicit typing preferred
- `import type` for type-only imports
- No `autorun`, `reaction`, `when` usage

Run auto-fix before committing:

```bash
yarn lint:fix
```

---

## Tests

- All core logic **must be covered by tests**
- Prefer unit tests over integration
- Deterministic behavior only

If a change affects lifecycle, GC, or identity — tests are **required**.

---

## Pull Requests

### Requirements

- Small, focused changes
- Clear commit messages
- No unrelated refactors
- No breaking API changes without discussion

### Commit Message Style

```
feat: add explicit entity cleanup phase
fix: prevent orphan collection leak
docs: clarify entity lifecycle rules
```

---

## Breaking Changes

Breaking changes are **not accepted** without:

1. Prior discussion in an issue
2. Clear migration path
3. Changelog entry

---

## Questions / Ideas

If you’re unsure whether something belongs in Nexigen —
**open an issue first**. Discussion is welcome.

---

Thank you for contributing 🚀
