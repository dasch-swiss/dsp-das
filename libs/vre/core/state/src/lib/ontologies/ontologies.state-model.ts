import { ReadOntology } from '@dasch-swiss/dsp-js';
import { IProjectOntologiesKeyValuePairs, OntologyProperties } from '../model-interfaces';

export class OntologiesStateModel {
  isLoading: boolean | undefined;
  projectOntologies: IProjectOntologiesKeyValuePairs = {};
  currentOntology: ReadOntology | null = null;
  currentProjectOntologyProperties: OntologyProperties[] = [];
}
