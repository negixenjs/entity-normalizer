import { createEntitySchema } from '@nexigen/entity-normalizer';

import { CommentModel } from './model';
import { ENTITY_KEY } from '../../constants';
import { viewerSchema } from '../viewer/schema';

export const commentSchema = createEntitySchema(
  ENTITY_KEY.COMMENTS,
  {
    viewer: viewerSchema,
  },
  {
    model: CommentModel,
    idAttribute: props => props.id,
  },
);
