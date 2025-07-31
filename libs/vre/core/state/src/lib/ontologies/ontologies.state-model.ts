import { ReadOntology } from '@dasch-swiss/dsp-js';
import { IProjectOntologiesKeyValuePairs } from '../model-interfaces';

export class OntologiesStateModel {
  isLoading: boolean | undefined;
  projectOntologies: IProjectOntologiesKeyValuePairs = {};
  currentOntology: ReadOntology | null = null;
}
