import { ReadOntology } from '@dasch-swiss/dsp-js';
import { IProjectOntologiesKeyValuePairs, OntologyProperties } from '../model-interfaces';

export class OntologiesStateModel {
  isLoading: boolean | undefined;
  hasLoadingErrors: boolean | undefined;
  ontologiesByIri: IProjectOntologiesKeyValuePairs = {};
  selectedOntology: ReadOntology | null = null;
  canSelectedOntologyBeDeleted = false;
  selectedOntologyPropertiesByIri: OntologyProperties[] = [];
  areOntologiesLoading = false;
}
