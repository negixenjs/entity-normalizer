
import type { EntitySchema } from './schema';
import type { EntitiesStore } from './store';
import type { META } from '../constants/values';

/**
 * Runtime schema type for infra layers
 */
export type AnySchema = EntitySchema<any, any>;

/**
 * Generic entity buckets shape
 * key   -> entityKey (string)
 * value -> map of id -> stored entity
 */
export type EntityBuckets = Record<string, Record<string, StoredEntity<any>>>;

/**
 * Resolver injected into models
 */
export type GetEntity = <T = any>(
  entityKey: string,
  id: string | number,
) => PublicEntity<StoredEntity<T>> | undefined;

/**
 * Entity model constructor contract
 */
export interface EntityModelCtor<TDto, TModel> {
  new (dto: TDto, getEntity: GetEntity): TModel;
}

/**
 * Schema options (runtime-oriented)
 */
export interface EntitySchemaOptions<TDto, TModel> {
  idAttribute?: ((input: any) => string | number) | string;
  processStrategy?: (input: any) => any;
  mergeStrategy?: (a: any, b: any) => any;
  model?: EntityModelCtor<TDto, TModel>;
}

/**
 * Core store type (no domain knowledge)
 */
export type TEntitiesStore = EntitiesStore;

/**
 * Entity metadata (infra concern)
 */
export type EntityMeta = {
  createdAt: number;
  updatedAt: number;
  accessedAt: number;
  refSources?: Set<string>;
};

/**
 * Stored entity = model + meta
 */
export type StoredEntity<T> = T & {
  _meta_nexigen: EntityMeta;
};

/**
 * Garbage collector item
 */
export type EntityGarbageCollectorItem = {
  id: string;
  meta: EntityMeta;
};

/**
 * Normalization output
 */
export interface NormalizedOutput {
  map: Partial<EntityBuckets>;
  ids: (string | number)[];
}

/**
 * Entity processing options
 */
export interface EntityProcessOptions<T> {
  data: T | T[];
  entityKey: string;
  sourceRefId: string;
  isCollection?: boolean;
}

/**
 * Persist snapshot shape
 */
export type EntitiesSnapshot = Record<string, Record<string, any>>;

/**
 * Public projection (hide meta from DX)
 */
export type PublicEntity<T> = Omit<T, typeof META>;
