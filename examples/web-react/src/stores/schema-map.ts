import { ENTITY_KEY } from '../constants';
import { commentSchema } from './comments/schema';
import { postSchema } from './posts/schema';
import { viewerSchema } from './viewer/schema';

export const schemaMap = {
  [ENTITY_KEY.VIEWERS]: viewerSchema,
  [ENTITY_KEY.COMMENTS]: commentSchema,
  [ENTITY_KEY.POSTS]: postSchema,
};
