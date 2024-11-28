import { IClassItemsKeyValuePairs } from '../model-interfaces';

export class OntologyClassStateModel {
  isLoading: boolean | undefined;
  classItems: IClassItemsKeyValuePairs = {}; // Ontology class items grouped by resource class id.
}
