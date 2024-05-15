import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-resource-page-2',
  template: '<app-resource *ngIf="resourceIri$ | async as resourceIri" [resourceIri]="resourceIri"></app-resource>',
})
export class ResourcePage2Component {
  resourceIri$ = this._route.params.pipe(
    map(params => {
      const projectCode = params.project;
      const resourceUuid = params.resource;
      if (projectCode && resourceUuid) {
        return this._resourceService.getResourceIri(projectCode, resourceUuid);
      }
    })
  );

  constructor(
    private _route: ActivatedRoute,
    private _resourceService: ResourceService
  ) {}
}
