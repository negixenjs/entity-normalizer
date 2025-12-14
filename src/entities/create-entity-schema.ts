import { EntitySchema } from './schema';

import type {
  PublicEntitySchema,
  EntitySchemaConfig,
  EntitySchemaDefinition,
} from './public';

export function createEntitySchema<TDto, TModel>(
  key: string,
  definition: EntitySchemaDefinition = {},
  config: EntitySchemaConfig<TDto, TModel> = {},
): PublicEntitySchema<TDto, TModel> {
  return new EntitySchema<TDto, TModel>(key, definition as any, config as any);
}
