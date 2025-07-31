import { Params } from '@angular/router';
import {
  ClassDefinition,
  OntologyMetadata,
  ReadOntology,
  ReadProject,
  ResourceClassDefinition,
  ResourceClassDefinitionWithAllLanguages,
} from '@dasch-swiss/dsp-js';
import { DspAppConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Selector } from '@ngxs/store';
import { ConfigState } from '../config.state';
import { ProjectsSelectors } from '../projects/projects.selectors';
import { ResourceSelectors } from '../resource/resource.selectors';
import { RouterSelectors } from '../router/router.selector';
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

  @Selector([OntologiesState])
  static isOntologiesLoading(state: OntologiesStateModel): boolean {
    return state.isOntologiesLoading;
  }

  @Selector([OntologiesState, ResourceSelectors.resource, ConfigState.getConfig, RouterSelectors.params])
  static projectOntology(
    state: OntologiesStateModel,
    resource: DspResource | null,
    dspApiConfig: DspAppConfig,
    params: Params | undefined
  ): ReadOntology | undefined {
    if (!resource || !params) return undefined;

    const projectIri = ProjectService.getProjectIri(params, dspApiConfig, resource);
    if (!projectIri || Object.values(state.projectOntologies).length === 0) return undefined;

    const projectReadOntologies = state.projectOntologies[projectIri].readOntologies;
    const projectReadOntologiesIndex = projectReadOntologies.findIndex(
      o => o.id.indexOf(`/${params[RouteConstants.ontoParameter]}/`) !== -1
    );

    return projectReadOntologiesIndex === -1 ? undefined : projectReadOntologies[projectReadOntologiesIndex];
  }

  @Selector([OntologiesState, ResourceSelectors.resource, ConfigState.getConfig, RouterSelectors.params])
  static currentOntologyClass(
    state: OntologiesStateModel,
    resource: DspResource | null,
    dspApiConfig: DspAppConfig,
    params: Params | undefined
  ): ClassDefinition | ResourceClassDefinition | ResourceClassDefinitionWithAllLanguages | undefined {
    if (!resource || !params) return undefined;

    const projectIri = ProjectService.getProjectIri(params, dspApiConfig, resource);
    if (!projectIri || Object.values(state.projectOntologies).length === 0) return undefined;

    const projectReadOntologies = state.projectOntologies[projectIri].readOntologies;
    const projectReadOntologiesIndex = projectReadOntologies.findIndex(
      o => o.id.indexOf(`/${params[RouteConstants.ontoParameter]}/`) !== -1
    );

    const projectOntology =
      projectReadOntologiesIndex === -1 ? undefined : projectReadOntologies[projectReadOntologiesIndex];

    if (!projectOntology) {
      return undefined;
    } else {
      const currentOntoClass = Object.values(projectOntology.classes).find(
        c => c.id.indexOf(`#${params[RouteConstants.classParameter]}`) !== -1
      );
      return currentOntoClass;
    }
  }
}
