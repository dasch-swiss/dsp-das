import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';

@Component({
  selector: 'app-create-resource-page',
  template: ` <h3>Create new resource of type: {{ classLabel }}</h3>
    <app-create-resource-form
      *ngIf="resourceClassIri"
      [resourceType]="classLabel"
      [resourceClassIri]="resourceClassIri"
      [projectIri]="projectIri"
      (createdResourceIri)="afterCreation($event)"></app-create-resource-form>`,
})
export class CreateResourcePageComponent {
  private _projectUuid = this._route.snapshot.params['uuid'] ?? this._route.parent!.snapshot.params['uuid'];

  get ontoId() {
    const iriBase = this._ontologyService.getIriBaseUrl();
    const ontologyName = this._route.snapshot.params[RouteConstants.ontoParameter];
    return `${iriBase}/ontology/${this._projectUuid}/${ontologyName}/v2`;
  }

  get resourceClassIri() {
    const className = this._route.snapshot.params[RouteConstants.classParameter];
    return `${this.ontoId}#${className}`;
  }

  get classLabel() {
    return this.resourceClassIri?.split('#')[1];
  }

  get projectIri() {
    return this._projectService.uuidToIri(this._projectUuid);
  }

  constructor(
    private _route: ActivatedRoute,
    private _ontologyService: OntologyService,
    protected _projectService: ProjectService,
    private _router: Router,
    private _resourceService: ResourceService
  ) {}

  afterCreation(resourceIri: string) {
    const uuid = this._resourceService.getResourceUuid(resourceIri);
    this._router.navigate(['..', uuid], { relativeTo: this._route });
  }
}
