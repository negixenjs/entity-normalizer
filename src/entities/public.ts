/**
 * ============================
 * Nexigen – Public Entity API
 * ============================
 */

/**
 * Primitive entity identifier
 */
export type EntityId = string | number;

/**
 * ============================
 * Entity Model Context
 * ============================
 */
export type EntityGetter = <T = any>(
  entityKey: string,
  id: string | number,
) => T | undefined;
/**
 * ============================
 * Entity Model Constructor
 * ============================
 *
 * User-defined domain model constructor.
 *
 * Example:
 *   class PostModel {
 *     constructor(dto: PostDto, ctx: EntityGetter) {}
 *   }
 */
export type EntityModelCtor<TDto, TModel> = new (
  dto: TDto,
  ctx: EntityGetter,
) => TModel;

/**
 * ============================
 * Public Entity Schema
 * ============================
 *
 * Read-only interface exposed to userland.
 * No normalization, no GC, no persistence details.
 */
export interface PublicEntitySchema<TDto, TModel> {
  /**
   * Unique entity key
   */
  readonly key: string;

  /**
   * Extract entity id from DTO
   */
  getId(input: TDto): EntityId;

  /**
   * Return id attribute key (string only)
   */
  getIdKey(): string;

  /**
   * Optional preprocessing before normalization
   */
  process(input: TDto): TDto;

  /**
   * Merge strategy for model updates
   */
  merge(target: TModel, source: Partial<TModel>): TModel;
}

/**
 * ============================
 * Entity Relations Definition
 * ============================
 *
 * Used to describe nested schemas.
 *
 * Example:
 * {
 *   author: userSchema,
 *   comments: [commentSchema],
 * }
 */
export type EntitySchemaDefinition = Record<
  string,
  PublicEntitySchema<any, any> | [PublicEntitySchema<any, any>]
>;

/**
 * ============================
 * Entity Schema Config
 * ============================
 *
 * User-provided configuration.
 */
export interface EntitySchemaConfig<TDto, TModel> {
  /**
   * ID attribute or resolver
   *
   * Default: "id"
   */
  idAttribute?: keyof TDto | ((dto: TDto) => EntityId);

  /**
   * Domain model constructor
   *
   * Example:
   *   model: PostModel
   */
  model?: EntityModelCtor<TDto, TModel>;

  /**
   * Optional DTO preprocessing
   */
  processStrategy?: (dto: TDto) => TDto;

  /**
   * Optional merge strategy
   */
  mergeStrategy?: (target: TModel, source: Partial<TModel>) => TModel;
}
