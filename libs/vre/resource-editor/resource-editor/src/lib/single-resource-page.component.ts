import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';
import { map } from 'rxjs';
import { ResourceFetcherComponent } from './resource-fetcher.component';

@Component({
  selector: 'app-single-resource-page',
  template: `
    <app-centered-layout>
      @if (resourceIri$ | async; as resourceIri) {
        <app-resource-fetcher [resourceIri]="resourceIri" [resourceVersion]="resourceVersion$ | async" />
      }
    </app-centered-layout>
  `,
  standalone: true,
  imports: [CenteredLayoutComponent, ResourceFetcherComponent, AsyncPipe],
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

  resourceVersion$ = this._route.queryParams.pipe(map(params => params['version']));

  constructor(
    private _route: ActivatedRoute,
    private _resourceService: ResourceService
  ) {}
}
