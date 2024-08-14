import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '@dasch-swiss/dsp-js';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { ProjectsSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

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

  @Select(ProjectsSelectors.currentProject) project$!: Observable<Project>;

  ontologyId = '';
  resourceClassIri = '';

  get classLabel() {
    return this.resourceClassIri ? this.resourceClassIri.split('#')[1] : '';
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
  ) {
    this.project$.pipe(take(1)).subscribe(project => {
      if (!project) {
        return;
      }
      this.ontologyId = this._ontologyService.getOntologyIriFromRoute(project.shortcode) || '';
      this.resourceClassIri = `${this.ontologyId}#${this._route.snapshot.params[RouteConstants.classParameter]}`;
    });
  }

  afterCreation(resourceIri: string) {
    const uuid = this._resourceService.getResourceUuid(resourceIri);
    this._router.navigate(['..', uuid], { relativeTo: this._route });
  }
}
