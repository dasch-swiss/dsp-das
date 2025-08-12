import { Inject, Injectable } from '@angular/core';
import { KnoraApiConnection, SystemPropertyDefinition } from '@dasch-swiss/dsp-js';
import { AdminProjectsApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { SetCurrentResourceAction } from '@dasch-swiss/vre/core/state';
import { DspResource, GenerateProperty } from '@dasch-swiss/vre/shared/app-common';
import { Store } from '@ngxs/store';
import { BehaviorSubject, filter, map, shareReplay, switchMap, take } from 'rxjs';
import { ResourceUtil } from './resource.util';

@Injectable()
export class ResourceFetcherService {
  private _resource = new BehaviorSubject<DspResource | undefined>(undefined);
  resource$ = this._resource.asObservable();

  resourceVersion?: string;

  projectShortcode$ = this.resource$.pipe(
    filter(resource => resource !== undefined),
    switchMap(resource => this._adminProjectsApiService.getAdminProjectsIriProjectiri(resource!.res.attachedToProject)),
    map(v => v.project.shortcode as unknown as string)
  );

  userCanEdit$ = this.resource$.pipe(
    map(resource => resource && this.resourceVersion === undefined && ResourceUtil.userCanEdit(resource.res))
  );

  userCanDelete$ = this.resource$.pipe(
    map(resource => resource && this.resourceVersion === undefined && ResourceUtil.userCanDelete(resource.res))
  );

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _adminProjectsApiService: AdminProjectsApiService,
    private _store: Store
  ) {}

  loadResource(resourceIri: string, resourceVersion?: string) {
    this.resourceVersion = resourceVersion;
    this._getResource(resourceIri, resourceVersion)
      .pipe(take(1))
      .subscribe(resource => {
        this._resource.next(resource);
      });
  }

  reload() {
    const resourceIri = this._resource.value?.res.id;
    if (resourceIri) {
      this.loadResource(resourceIri);
    }
  }

  private _getResource(resourceIri: string, resourceVersion?: string) {
    return this._dspApiConnection.v2.res.getResource(resourceIri, resourceVersion).pipe(
      map(response => {
        const res = new DspResource(response);
        res.resProps = GenerateProperty.commonProperty(res.res);
        res.systemProps = res.res.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);

        this._store.dispatch(new SetCurrentResourceAction(res));
        return res;
      })
    );
  }
}
