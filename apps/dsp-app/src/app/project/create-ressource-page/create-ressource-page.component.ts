import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReadProject, ResourceClassDefinition, StoredProject } from '@dasch-swiss/dsp-js';
import { getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/shared/app-api';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import {
  IProjectOntologiesKeyValuePairs,
  OntologiesSelectors,
  ProjectsSelectors,
  UserSelectors,
} from '@dasch-swiss/vre/shared/app-state';
import { Select } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-create-ressource-page',
  template: ` <app-create-ressource-form
    [resourceType]="(resClass$ | async)?.label"
    [resourceClassIri]="classId$ | async"
    [projectIri]="projectIri"></app-create-ressource-form>`,
})
export class CreateRessourcePageComponent {
  @Select(OntologiesSelectors.projectOntologies)
  projectOntologies$: Observable<IProjectOntologiesKeyValuePairs>;
  @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;
  @Select(UserSelectors.userProjects) userProjects$: Observable<StoredProject[]>;
  @Select(ProjectsSelectors.currentProject) project$: Observable<ReadProject>;

  projectUuid = this._route.snapshot.params.uuid
    ? this._route.snapshot.params.uuid
    : this._route.parent.snapshot.params.uuid;

  constructor(
    private _route: ActivatedRoute,
    private _ontologyService: OntologyService,
    protected _projectService: ProjectService
  ) {}

  get instanceId$(): Observable<string> {
    return this._route.params.pipe(map(params => params[RouteConstants.instanceParameter]));
  }

  // id (iri) of resource class
  get classId$(): Observable<string> {
    return combineLatest([this.ontoId$, this._route.params]).pipe(
      map(([ontoId, params]) => {
        const className = params[RouteConstants.classParameter];
        return `${ontoId}#${className}`;
      })
    );
  }

  get ontoId$(): Observable<string> {
    return combineLatest([this.project$, this._route.params]).pipe(
      takeWhile(([project]) => project !== undefined),
      map(([project, params]) => {
        const iriBase = this._ontologyService.getIriBaseUrl();
        const ontologyName = params[RouteConstants.ontoParameter];
        // get the resource ids from the route. Do not use the RouteConstants ontology route constant here,
        // because the ontology and class ids are not defined within the apps domain. They are defined by
        // the api and can not be changed generically via route constants.
        return `${iriBase}/ontology/${project.shortcode}/${ontologyName}/v2`;
      })
    );
  }

  get projectIri() {
    return this._projectService.uuidToIri(this.projectUuid);
  }

  get resClass$(): Observable<ResourceClassDefinition> {
    return combineLatest([
      this.projectOntologies$,
      this.classId$,
      this.ontoId$,
      this.instanceId$,
      this.userProjects$,
      this.isSysAdmin$,
    ]).pipe(
      map(([projectOntologies, classId, ontoId, instanceId, userProjects, isSysAdmin]) => {
        if (
          instanceId !== RouteConstants.addClassInstance ||
          (instanceId === RouteConstants.addClassInstance &&
            !(userProjects?.some(p => p.id === this.projectIri) || isSysAdmin)) ||
          !projectOntologies[this.projectIri]
        ) {
          return;
        }

        const ontology = projectOntologies[this.projectIri].readOntologies.find(onto => onto.id === ontoId);
        if (ontology) {
          // find ontology of current resource class to get the class label
          const classes = getAllEntityDefinitionsAsArray(ontology.classes);
          return <ResourceClassDefinition>classes[classes.findIndex(res => res.id === classId)];
        }
      })
    );
  }
}
