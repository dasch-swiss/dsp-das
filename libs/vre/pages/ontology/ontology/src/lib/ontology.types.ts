import {
  CreateResourceClass,
  CreateResourceProperty,
  UpdateResourceClassCardinality,
  UpdateResourcePropertyLabel,
} from '@dasch-swiss/dsp-js';
import { UpdateEntityCommentOrLabel } from '@dasch-swiss/dsp-js/src/models/v2/ontologies/update/update-entity-comment-or-label';

export type UpdateOntologyT =
  | CreateResourceProperty
  | UpdateResourceClassCardinality
  | UpdateEntityCommentOrLabel
  | UpdateResourcePropertyLabel
  | CreateResourceClass;
