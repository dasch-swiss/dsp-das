import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { map } from 'rxjs';

@Component({
  selector: 'app-single-resource-page',
  template: ` <app-resource-fetcher *ngIf="resourceIri$ | async as resourceIri" [resourceIri]="resourceIri" />`,
})
export class SingleResourcePageComponent {
  resourceIri$ = this._route.params.pipe(
    map(params => {
      const projectCode = params['project'];
      const resourceUuid = params['resource'];
      if (projectCode && resourceUuid) {
        return this._resourceService.getResourceIri(projectCode, resourceUuid);
      }
      return undefined;
    })
  );

  constructor(
    private _route: ActivatedRoute,
    private _resourceService: ResourceService
  ) {}
}
