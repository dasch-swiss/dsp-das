import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppConfigService, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';
import { map } from 'rxjs';
import { ResourceFetcherComponent } from './resource-fetcher.component';

@Component({
  selector: 'app-resource-page',
  template: `<app-centered-layout>
    @if (resourceIri$ | async; as resourceIri) {
      <app-resource-fetcher [resourceIri]="resourceIri" (afterResourceDeleted)="updateResourceCount()" />
    }
  </app-centered-layout>`,
  standalone: true,
  imports: [CenteredLayoutComponent, ResourceFetcherComponent, AsyncPipe],
})
export class ResourcePageComponent {
  constructor(
    private _route: ActivatedRoute,
    private _acs: AppConfigService,
    private _projectPageService: ProjectPageService
  ) {}

  instanceId = this._route.snapshot.params[RouteConstants.instanceParameter];

  project$ = this._projectPageService.currentProject$;
  resourceIri$ = this.project$.pipe(
    map(project => `${this._acs.dspAppConfig.iriBase}/${project.shortcode}/${this.instanceId}`)
  );

  updateResourceCount(): void {
    this._projectPageService.reloadProject();
  }
}
