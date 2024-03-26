import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReadProject, ResourceClassDefinition } from '@dasch-swiss/dsp-js';
import { getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/shared/app-api';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import {
  IProjectOntologiesKeyValuePairs,
  OntologiesSelectors,
  ProjectsSelectors,
} from '@dasch-swiss/vre/shared/app-state';
import { Select } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-create-ressource-page',
  template: ` <app-create-ressource-form
    [resourceType]="(resClass$ | async)?.label"
    [resourceClassIri]="classIri$ | async"
    [projectIri]="projectIri"></app-create-ressource-form>`,
})
export class CreateRessourcePageComponent {
  @Select(OntologiesSelectors.projectOntologies)
  projectOntologies$: Observable<IProjectOntologiesKeyValuePairs>;
  @Select(ProjectsSelectors.currentProject) project$: Observable<ReadProject>;

  projectUuid = this._route.snapshot.params.uuid ?? this._route.parent.snapshot.params.uuid;

  constructor(
    private _route: ActivatedRoute,
    private _ontologyService: OntologyService,
    protected _projectService: ProjectService
  ) {}

  classIri$ = this.ontoId$.pipe(
    map(ontoId => {
      const className = this._route.snapshot.params[RouteConstants.classParameter];
      return `${ontoId}#${className}`;
    })
  );

  get ontoId$(): Observable<string> {
    return combineLatest([this.project$, this._route.params]).pipe(
      takeWhile(([project]) => project !== undefined),
      map(([project, params]) => {
        const iriBase = this._ontologyService.getIriBaseUrl();
        const ontologyName = params[RouteConstants.ontoParameter];
        return `${iriBase}/ontology/${project.shortcode}/${ontologyName}/v2`;
      })
    );
  }

  get projectIri() {
    return this._projectService.uuidToIri(this.projectUuid);
  }

  get resClass$(): Observable<ResourceClassDefinition> {
    return combineLatest([this.projectOntologies$, this.classIri$, this.ontoId$]).pipe(
      map(([projectOntologies, classId, ontoId]) => {
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
