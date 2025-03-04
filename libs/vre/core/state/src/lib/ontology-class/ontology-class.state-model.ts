import { IClassItemsKeyValuePairs } from '../model-interfaces';

export class OntologyClassStateModel {
  isLoading: boolean | undefined = false;
  classItemsById: IClassItemsKeyValuePairs = {};
}
