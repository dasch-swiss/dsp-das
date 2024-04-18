import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceClassDefinition } from '@dasch-swiss/dsp-js';
import { getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/shared/app-api';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { OntologiesSelectors, ProjectsSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-create-resource-page',
  template: ` <app-create-resource-form
    *ngIf="classIri$ | async as classIri"
    [resourceType]="(resClass$ | async)?.label"
    [resourceClassIri]="classIri"
    [projectIri]="projectIri"
    (createdResourceIri)="afterCreation($event)"></app-create-resource-form>`,
})
export class CreateResourcePageComponent {
  projectOntologies$ = this._store.select(OntologiesSelectors.projectOntologies);
  project$ = this._store.select(ProjectsSelectors.currentProject);
  projectUuid = this._route.snapshot.params.uuid ?? this._route.parent.snapshot.params.uuid;

  constructor(
    private _route: ActivatedRoute,
    private _ontologyService: OntologyService,
    private _store: Store,
    protected _projectService: ProjectService,
    private _router: Router,
    private _resourceService: ResourceService
  ) {}

  ontoId$ = this.project$.pipe(
    filter(project => project !== undefined),
    map(project => {
      const iriBase = this._ontologyService.getIriBaseUrl();
      const ontologyName = this._route.snapshot.params[RouteConstants.ontoParameter];
      return `${iriBase}/ontology/${project.shortcode}/${ontologyName}/v2`;
    })
  );

  classIri$ = this.ontoId$.pipe(
    map(ontoId => {
      const className = this._route.snapshot.params[RouteConstants.classParameter];
      return `${ontoId}#${className}`;
    })
  );

  get projectIri() {
    return this._projectService.uuidToIri(this.projectUuid);
  }

  resClass$ = combineLatest([
    this.projectOntologies$.pipe(filter(v => Object.keys(v).length !== 0)),
    this.classIri$,
    this.ontoId$,
  ]).pipe(
    map(([projectOntologies, classId, ontoId]) => {
      const ontology = projectOntologies[this.projectIri].readOntologies.find(onto => onto.id === ontoId);
      if (ontology) {
        // find ontology of current resource class to get the class label
        const classes = getAllEntityDefinitionsAsArray(ontology.classes);
        return <ResourceClassDefinition>classes[classes.findIndex(res => res.id === classId)];
      }
    })
  );

  afterCreation(resourceIri: string) {
    const uuid = this._resourceService.getResourceUuid(resourceIri);
    this._router.navigate(['..', uuid], { relativeTo: this._route });
  }
}
