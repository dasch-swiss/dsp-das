import { Component } from '@angular/core';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-project-sidenav',
  template: ` <div class="main-content">
    <!-- Project label -->
    <div *ngIf="currentProject$ | async as currentProject" class="project-title">
      <p #projectTitle [matTooltip]="currentProject" [matTooltipShowDelay]="500" matTooltipPosition="right">
        {{ currentProject.longname }}
      </p>
    </div>
    <mat-list class="main-list">
      <mat-divider />
      <app-projects-sidenav-links />
      <mat-divider />
      <app-projects-sidenav-ontologies />
    </mat-list>
  </div>`,
})
export class ProjectSidenavComponent {
  protected readonly routeConstants = RouteConstants;

  currentProject$ = this._store.select(ProjectsSelectors.currentProject);

  constructor(private _store: Store) {}
}
