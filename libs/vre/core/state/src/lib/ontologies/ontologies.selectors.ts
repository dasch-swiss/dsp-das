import { OntologyMetadata, ReadOntology, ReadProject } from '@dasch-swiss/dsp-js';
import { Selector } from '@ngxs/store';
import { ProjectsSelectors } from '../projects/projects.selectors';
import { OntologiesState } from './ontologies.state';
import { OntologiesStateModel } from './ontologies.state-model';

export class OntologiesSelectors {
  @Selector([OntologiesState])
  static isLoading(state: OntologiesStateModel): boolean | undefined {
    return state.isLoading;
  }

  @Selector([OntologiesState, ProjectsSelectors.currentProject])
  static currentProjectOntologyMetadata(
    state: OntologiesStateModel,
    project: ReadProject | undefined
  ): OntologyMetadata[] {
    if (!project || !state.projectOntologies[project.id]) {
      return [];
    }
    return state.projectOntologies[project.id].ontologiesMetadata;
  }

  @Selector([OntologiesState, ProjectsSelectors.currentProject])
  static currentProjectOntologies(state: OntologiesStateModel, project: ReadProject | undefined): ReadOntology[] {
    if (!project || !state.projectOntologies[project.id]) {
      return [];
    }
    return state.projectOntologies[project.id].readOntologies;
  }
}
