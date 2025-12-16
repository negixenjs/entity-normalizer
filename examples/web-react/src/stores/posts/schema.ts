import { createEntitySchema } from '@nexigen/entity-normalizer';

import { PostModel } from './model';
import { ENTITY_KEY } from '../../constants';
import { commentSchema } from '../comments/schema';
import { viewerSchema } from '../viewer/schema';

export const postSchema = createEntitySchema(
  ENTITY_KEY.POSTS,
  {
    viewer: viewerSchema,
    comments: [commentSchema],
  },
  {
    model: PostModel,
    idAttribute: props => props.id,
  },
);
