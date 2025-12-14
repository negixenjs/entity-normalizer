import type { EntitySchemaOptions, EntityModelCtor } from './types';

export class EntitySchema<TDto, TModel> {
  constructor(
    public key: string,
    public definition: Record<
      string,
      EntitySchema<any, any> | [EntitySchema<any, any>]
    > = {},
    public options: EntitySchemaOptions<TDto, TModel> = {},
  ) {}

  get model(): EntityModelCtor<TDto, TModel> | undefined {
    return this.options.model;
  }

  getId(input: TDto) {
    const { idAttribute = 'id' } = this.options;
    return typeof idAttribute === 'function'
      ? idAttribute(input)
      : (input as any)[idAttribute];
  }

  getIdKey() {
    const { idAttribute = 'id' } = this.options;
    return typeof idAttribute === 'string' ? idAttribute : 'id';
  }

  process(input: TDto): TDto {
    return this.options.processStrategy
      ? this.options.processStrategy(input)
      : { ...input };
  }

  merge(target: TModel, source: Partial<TModel>) {
    return this.options.mergeStrategy
      ? this.options.mergeStrategy(target, source)
      : Object.assign(target as any, source);
  }
}
