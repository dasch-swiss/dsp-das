import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { filter, map, startWith } from 'rxjs';

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
        *ngIf="isAdmin$ | async"
        [link]="[routeConstants.settings]"
        [label]="'Project Settings'"
        [icon]="'settings'"
        [active]="true" />

      <app-projects-sidenav-links-item
        [link]="[routeConstants.dataModels]"
        [label]="'Data Model'"
        [icon]="'bubble_chart'"
        [active]="(activeForDataModels$ | async) || false" />
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

  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  activeForDataModels$ = this._router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    startWith(null),
    map(() => {
      const url = this._router.url;
      return (
        url.includes(RouteConstants.dataModels) ||
        url.includes(RouteConstants.ontology) ||
        url.includes(RouteConstants.list)
      );
    })
  );

  constructor(
    private _store: Store,
    private _router: Router
  ) {}
}
