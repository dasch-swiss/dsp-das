import { Inject, Injectable } from '@angular/core';
import { KnoraApiConnection, SystemPropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { SetCurrentResourceAction } from '@dasch-swiss/vre/core/state';
import { DspResource, GenerateProperty } from '@dasch-swiss/vre/shared/app-common';
import { Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class ResourceFetcherService {
  private _loadResourceSubject = new ReplaySubject<Observable<DspResource>>(1);
  private _reloadSubject = new BehaviorSubject<null>(null);

  resource$ = combineLatest([this._loadResourceSubject.asObservable(), this._reloadSubject.asObservable()]).pipe(
    switchMap(([resource$]) => resource$)
  );

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _store: Store
  ) {}

  onInit(resourceIri: string) {
    this._loadResourceSubject.next(this._getResource(resourceIri));
  }

  onDestroy() {}

  reload() {
    this._reloadSubject.next(null);
  }

  private _getResource(resourceIri: string) {
    return this._dspApiConnection.v2.res.getResource(resourceIri).pipe(
      map(response => {
        const res = new DspResource(response);
        res.resProps = GenerateProperty.commonProperty(res.res);

        // gather system property information
        res.systemProps = res.res.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);
        this._store.dispatch(new SetCurrentResourceAction(res));
        return res;
      })
    );
  }
}
