import type { AnySchema } from '../types';

export class SchemaWalker {
  constructor(private schemaMap: Record<string, AnySchema>) {}

  walkFields(
    entityKey: string,
    entity: any,
    cb: (childKey: string, id: string | number) => void,
  ) {
    const schema = this.schemaMap[entityKey];
    if (!schema) {
      return;
    }

    for (const field of Object.keys(schema.definition)) {
      const subschema = schema.definition[field] as AnySchema | [AnySchema];
      const isArray = Array.isArray(subschema);
      const childSchema = isArray ? subschema[0] : subschema;

      const childKey = childSchema.key;

      const idKey = `${field}Id`;
      const value = entity[idKey];
      if (!value) {
        continue;
      }

      if (isArray) {
        if (!Array.isArray(value)) {
          continue;
        }
        for (const id of value) {
          cb(childKey, id);
        }
      } else {
        cb(childKey, value);
      }
    }
  }
}
