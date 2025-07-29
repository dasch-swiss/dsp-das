import { Component } from '@angular/core';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-ontology-sidenav',
  template: `
    <nav mat-tab-nav-bar mat-stretch-tabs="false" mat-align-tabs="start" [tabPanel]="tabPanel" class="narrow-tab-nav">
      <a
        mat-tab-link
        routerLink="./{{ RouteConstants.classes }}"
        routerLinkActive
        #rla1="routerLinkActive"
        [active]="rla1.isActive">
        Classes
      </a>
      <a
        mat-tab-link
        routerLink="./{{ RouteConstants.properties }}"
        routerLinkActive
        #rla2="routerLinkActive"
        [active]="rla2.isActive">
        Properties
      </a>
    </nav>
    <div #tabPanel></div>
  `,
  styles: [
    `
      .narrow-tab-nav {
        background: none;
        padding: 0 1rem;
      }
    `,
  ],
})
export class OntologySidenavComponent {
  project$ = this._store.select(ProjectsSelectors.currentProject);
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  readonly RouteConstants = RouteConstants;

  constructor(private _store: Store) {}
}
