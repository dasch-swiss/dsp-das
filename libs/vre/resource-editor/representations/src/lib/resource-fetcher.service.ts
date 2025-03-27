import { Inject, Injectable } from '@angular/core';
import { KnoraApiConnection, SystemPropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { OntologiesSelectors, SetCurrentResourceAction } from '@dasch-swiss/vre/core/state';
import { DspResource, GenerateProperty } from '@dasch-swiss/vre/shared/app-common';
import { ComponentCommunicationEventService, EmitEvent, Events } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

@Injectable()
export class ResourceFetcherService {
  private _loadResourceSubject = new Subject<Observable<DspResource>>();
  resourceFetcher$ = this._loadResourceSubject.asObservable().pipe(switchMap(obs$ => obs$));

  private _reloadSubject = new BehaviorSubject<null>(null);

  resource$ = combineLatest([this.resourceFetcher$, this._reloadSubject.asObservable()]).pipe(
    tap(() => console.log('got it')),
    map(([resource$]) => resource$)
  );

  private _resourceIsDeletedSubject = new Subject<void>();
  resourceIsDeleted$ = this._resourceIsDeletedSubject.asObservable();

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _store: Store,
    private _translateService: TranslateService,
    private _componentCommsService: ComponentCommunicationEventService
  ) {}

  onInit(resourceIri: string) {
    this._loadResourceSubject.next(this._getResource(resourceIri));

    this._handleTranslation();
  }

  onDestroy() {
    this._store.dispatch(new SetCurrentResourceAction(null));
  }

  reload() {
    this._reloadSubject.next(null);
  }

  resourceIsDeleted() {
    this._resourceIsDeletedSubject.next();
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

  private _handleTranslation() {
    this._translateService.onLangChange
      .pipe(
        switchMap(() => this._store.select(OntologiesSelectors.projectOntology)),
        map(currentOntology => {
          if (currentOntology !== undefined && !!currentOntology.id) {
            this._dspApiConnection.v2.ontologyCache.reloadCachedItem(currentOntology!.id).pipe(take(1));
          }
        })
      )
      .subscribe(() => {
        this._componentCommsService.emit(new EmitEvent(Events.resourceLanguageChanged));
      });
  }
}
