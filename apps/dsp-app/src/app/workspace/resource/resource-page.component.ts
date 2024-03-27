import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppConfigService, RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectsSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { filter, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-resource-page',
  template:
    ' <h2>Resourcepage</h2><app-resource *ngIf="resourceIri$ | async as resourceIri" [resourceIri]="resourceIri"></app-resource>',
})
export class ResourcePageComponent {
  constructor(
    private _route: ActivatedRoute,
    private _acs: AppConfigService,
    private _store: Store
  ) {}

  instanceId = this._route.snapshot.params[RouteConstants.instanceParameter];

  project$ = this._store.select(ProjectsSelectors.currentProject);
  resourceIri$ = this.project$.pipe(
    filter(v => v !== undefined),
    tap(v => console.log('ddsf', v)),
    map(project => `${this._acs.dspAppConfig.iriBase}/${project.shortcode}/${this.instanceId}`)
  );
}
