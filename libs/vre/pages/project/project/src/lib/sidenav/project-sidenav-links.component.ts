import { Component } from '@angular/core';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '../project-page.service';

@Component({
  selector: 'app-projects-sidenav-links',
  template: `
    <mat-list>
      <app-projects-sidenav-links-item
        [link]="[routeConstants.advancedSearch]"
        [label]="'Advanced Search'"
        [icon]="'search'"
        [active]="true" />

      <app-projects-sidenav-links-item
        [link]="[routeConstants.projectDescription]"
        [label]="'Project Description'"
        [icon]="'description'"
        [active]="true" />

      <app-projects-sidenav-links-item
        *ngIf="hasProjectAdminRights$ | async"
        [link]="[routeConstants.settings]"
        [label]="'Project Settings'"
        [icon]="'settings'"
        [active]="true" />

      <app-projects-sidenav-links-item
        [link]="[routeConstants.dataModels]"
        [label]="'Data Model'"
        [icon]="'bubble_chart'"
        [active]="false" />
      <!-- TODO -->
    </mat-list>
  `,
  styles: [
    `
      mat-list {
        padding: 0;
      }
    `,
  ],
})
export class ProjectSidenavLinksComponent {
  protected readonly routeConstants = RouteConstants;

  hasProjectAdminRights$ = this._projectPageService.hasProjectAdminRights$;

  constructor(private _projectPageService: ProjectPageService) {}
}
