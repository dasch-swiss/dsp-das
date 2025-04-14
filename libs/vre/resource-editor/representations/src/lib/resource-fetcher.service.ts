import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KnoraApiConnection, SystemPropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { SetCurrentResourceAction } from '@dasch-swiss/vre/core/state';
import { DspResource, GenerateProperty } from '@dasch-swiss/vre/shared/app-common';
import { Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class ResourceFetcherService {
  private _reloadSubject = new BehaviorSubject(null);
  resource$!: Observable<DspResource>;

  private _resourceVersionSubject = new BehaviorSubject<string | undefined>(undefined);
  resourceVersion$ = this._resourceVersionSubject.asObservable();

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _store: Store,
    private _route: ActivatedRoute
  ) {
    this._route.queryParams.subscribe(params => {
      if (params['version']) {
        this._resourceVersionSubject.next(params['version']);
      }
    });
  }

  onInit(resourceIri: string, version?: string) {
    if (version) {
      this._resourceVersionSubject.next(version);
    }

    this.resource$ = combineLatest([this._reloadSubject.asObservable(), this.resourceVersion$]).pipe(
      switchMap(([reload, resourceVersion]) => this._getResource(resourceIri, resourceVersion))
    );
  }

  reload() {
    this._reloadSubject.next(null);
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
