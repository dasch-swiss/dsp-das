import { Inject, Injectable } from '@angular/core';
import { KnoraApiConnection, ReadResource, SystemPropertyDefinition } from '@dasch-swiss/dsp-js';
import { Common, DspResource } from '@dasch-swiss/vre/shared/app-common';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class ResourceFetcherService {
  private _resourceIri!: string;
  private _loadResource = new BehaviorSubject(null);
  resource$ = this._loadResource.asObservable().pipe(switchMap(() => this._getResource()));

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  onInit(resourceIri: string) {
    this._resourceIri = resourceIri;
  }

  reload() {
    this._loadResource.next(null);
  }

  private _getResource() {
    return this._dspApiConnection.v2.res.getResource(this._resourceIri).pipe(
      map(response => {
        const res = new DspResource(response as ReadResource);
        res.resProps = Common.initProps(res.res);

        // gather system property information
        res.systemProps = res.res.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);
        return res;
      })
    );
  }
}
