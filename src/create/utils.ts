export function defineHiddenProp<T extends object, K extends string>(
  obj: T,
  key: K,
  value: any,
) {
  Object.defineProperty(obj, key, {
    value,
    enumerable: false,
    configurable: true,
    writable: true,
  });
}

export function deepClone<T>(value: T): T {
  // structuredClone is ideal for snapshots (handles Maps/Sets/Date, etc.)
  // Fallback: JSON clone for plain data.
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(value);
    }
  } catch {}

  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    // Last resort: return as-is (better than crash).
    return value;
  }
}

export function isPlainObject(value: unknown): value is Record<string, any> {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
