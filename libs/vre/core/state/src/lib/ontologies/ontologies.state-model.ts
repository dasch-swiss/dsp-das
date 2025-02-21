import { ReadOntology } from '@dasch-swiss/dsp-js';
import { IProjectOntologiesKeyValuePairs, OntologyProperties } from '../model-interfaces';

export class OntologiesStateModel {
  isLoading: boolean | undefined = false;
  hasLoadingErrors: boolean | undefined = false;
  ontologiesByIri: IProjectOntologiesKeyValuePairs = {};
  ontology: ReadOntology | null = null;
  canOntologyBeDeleted = false;
  ontologyPropertiesByIri: OntologyProperties[] = [];
  areOntologiesLoading = false;
}
