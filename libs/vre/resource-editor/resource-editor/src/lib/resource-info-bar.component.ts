import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ReadProject, ReadResource } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { GetAttachedProjectAction, GetAttachedUserAction, ResourceSelectors } from '@dasch-swiss/vre/core/state';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-resource-info-bar',
  template: `
    <div class="infobar mat-caption" *ngIf="project$ | async as project">
      Resource of the project
      <a (click)="openProject(project)" class="link" [title]="project.longname">
        <strong>{{ project?.shortname }}</strong></a
      ><span *ngIf="resourceAttachedUser$ | async as resourceAttachedUser">
        >, created
        <span *ngIf="resourceAttachedUser"
          >by
          {{
            resourceAttachedUser?.givenName || resourceAttachedUser?.familyName
              ? resourceAttachedUser?.givenName + ' ' + resourceAttachedUser?.familyName
              : resourceAttachedUser?.username
          }}</span
        >
        <span *ngIf="resource.creationDate"> on {{ resource.creationDate | date }}</span>
      </span>
    </div>
  `,
  styles: [
    `
      .infobar {
        box-sizing: border-box;
        white-space: nowrap;
        color: rgba(0, 0, 0, 0.87);
      }
    `,
  ],
})
export class ResourceInfoBarComponent implements OnChanges {
  @Input({ required: true }) resource!: ReadResource;

  resourceAttachedUser$ = this._resourceFetcherService.attachedUser$;

  project$ = this._store.select(ResourceSelectors.attachedProjects).pipe(
    filter(attachedProjects => attachedProjects[this.resource.id]?.value?.length > 0),
    map(attachedProjects =>
      attachedProjects[this.resource.id].value.find(u => u.id === this.resource.attachedToProject)
    )
  );

  constructor(
    private _store: Store,
    private router: Router,
    private _resourceFetcherService: ResourceFetcherService
  ) {}

  ngOnChanges() {
    this._getResourceAttachedData(this.resource);
  }

  openProject(project: ReadProject) {
    this.router.navigate([RouteConstants.projectRelative, ProjectService.IriToUuid(project.id)]);
  }

  private _getResourceAttachedData(resource: ReadResource): void {
    this._store.dispatch([
      new GetAttachedUserAction(resource.id, resource.attachedToUser),
      new GetAttachedProjectAction(resource.id, resource.attachedToProject),
    ]);
  }
}
