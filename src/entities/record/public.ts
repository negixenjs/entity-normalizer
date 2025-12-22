// Public snapshot type
export interface EntityRecordSnapshot {
  id: string | number | null;
}

// Public API contract
export interface EntityRecord<T, M> {
  // -------- state --------

  /** Current entity id or null */
  readonly entityId: string | number | null;

  /** Resolved entity model (may trigger lazy cleanup) */
  readonly data: M | undefined;

  /** True if record points to existing entity */
  readonly exists: boolean;

  /** True if record is empty (no id) */
  readonly isEmpty: boolean;

  /** Stable record identifier */
  readonly recordId: string;

  // -------- mutations --------

  /** Normalize & set entity, replaces id */
  set(item: T): void;

  /** Normalize entity without changing id */
  update(item: T): void;

  /** Clear record and cascade delete */
  reset(): void;

  /** Resolve temp id to real entity */
  resolve(tempId: string | number, real: T): void;

  // -------- snapshot --------

  /** Serialize record state */
  getSnapshot(): EntityRecordSnapshot;

  /** Restore record state */
  applySnapshot(snapshot: EntityRecordSnapshot): void;
}
