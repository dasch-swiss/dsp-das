import { ReadOntology } from '@dasch-swiss/dsp-js';
import { IProjectOntologiesKeyValuePairs, OntologyProperties } from '../model-interfaces';

export class OntologiesStateModel {
  isLoading: boolean | undefined;
  hasLoadingErrors: boolean | undefined; // loading error state
  projectOntologies: IProjectOntologiesKeyValuePairs = {}; // project ontologies grouped by project IRI
  currentOntology: ReadOntology | null = null; // the currently selected ontology
  currentOntologyCanBeDeleted = false;
  currentProjectOntologyProperties: OntologyProperties[] = []; // reflects current ontology properties in data model grouped by ontology IRI
  isOntologiesLoading: boolean = false; // loading state for project ontologies
}
