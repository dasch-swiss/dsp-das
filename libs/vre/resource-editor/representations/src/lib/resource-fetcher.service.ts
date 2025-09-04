import { Inject, Injectable } from '@angular/core';
import { KnoraApiConnection, ReadUser, SystemPropertyDefinition } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { AdminProjectsApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { DspResource, GenerateProperty } from '@dasch-swiss/vre/shared/app-common';
import { BehaviorSubject, filter, map, switchMap, take, Observable, shareReplay } from 'rxjs';
import { ResourceUtil } from './resource.util';

@Injectable()
export class ResourceFetcherService {
  private _resource = new BehaviorSubject<DspResource | undefined>(undefined);
  resource$ = this._resource.asObservable();

  resourceVersion?: string;

  userCanEdit$ = this.resource$.pipe(
    map(resource => resource && this.resourceVersion === undefined && ResourceUtil.userCanEdit(resource.res))
  );

  userCanDelete$ = this.resource$.pipe(
    map(resource => resource && this.resourceVersion === undefined && ResourceUtil.userCanDelete(resource.res))
  );

  attachedUser$ = this.resource$.pipe(
    filter(resource => resource !== undefined),
    switchMap(resource => this._userApiService.get(resource.res.attachedToUser).pipe(map(response => response.user)))
  );

  projectShortcode$ = this.resource$.pipe(
    filter(resource => resource !== undefined),
    switchMap(resource => this._adminProjectsApiService.getAdminProjectsIriProjectiri(resource.res.attachedToProject)),
    map(v => v.project.shortcode as unknown as string),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _adminProjectsApiService: AdminProjectsApiService,
    private _userApiService: UserApiService
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
        return res;
      })
    );
  }
}
