import { createEntitySchema } from '@nexigen/entity-normalizer';

import { ViewerModel } from './model';
import { ENTITY_KEY } from '../../constants';

export const viewerSchema = createEntitySchema(
  ENTITY_KEY.VIEWERS,
  {},
  {
    model: ViewerModel,
    idAttribute: props => props.id,
  },
);
