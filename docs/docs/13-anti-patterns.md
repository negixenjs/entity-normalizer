
# Anti-Patterns

Violating these rules breaks Nexigen guarantees.

---

## Common Mistakes

- storing DTOs in stores
- cloning entity data
- mutating entities outside models
- bypassing collections

---

## Symptoms

- stale UI
- duplicated data
- memory growth
- unpredictable behavior

---

## Fix

Return to:
- entities as single source of truth
- stores as orchestrators
