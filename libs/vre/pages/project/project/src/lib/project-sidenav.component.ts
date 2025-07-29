import { Component } from '@angular/core';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-project-sidenav',
  template: `
    <div *ngIf="currentProject$ | async as currentProject" class="project-title">
      <span [matTooltip]="currentProject.longname || ''" [matTooltipShowDelay]="500" matTooltipPosition="right">
        {{ currentProject.longname }}
      </span>
    </div>

    <mat-divider />

    <mat-list>
      <app-projects-sidenav-links />

      <mat-divider />

      <app-projects-sidenav-ontologies />
    </mat-list>
  `,
})
export class ProjectSidenavComponent {
  currentProject$ = this._store.select(ProjectsSelectors.currentProject);

  constructor(private _store: Store) {}
}
