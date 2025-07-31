import { Component } from '@angular/core';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-project-sidenav',
  template: `
    <div *ngIf="currentProject$ | async as currentProject" class="project-title">{{ currentProject.longname }}</div>
    <mat-divider />
    <app-projects-sidenav-links />
    <mat-divider />
    <app-projects-sidenav-ontologies />
  `,
  styles: [
    `
      :host {
        width: 290px;
        display: block;
      }

      .project-title {
        padding: 20px 16px 20px 16px;

        font-size: 24px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0px;
      }
    `,
  ],
})
export class ProjectSidenavComponent {
  currentProject$ = this._store.select(ProjectsSelectors.currentProject);

  constructor(private _store: Store) {}
}
