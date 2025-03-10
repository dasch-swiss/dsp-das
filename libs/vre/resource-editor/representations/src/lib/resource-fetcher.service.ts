import { Inject, Injectable } from '@angular/core';
import { KnoraApiConnection, ReadResource, SystemPropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { OntologiesSelectors, SetCurrentResourceAction } from '@dasch-swiss/vre/core/state';
import { DspResource, GenerateProperty } from '@dasch-swiss/vre/shared/app-common';
import { ComponentCommunicationEventService, EmitEvent, Events } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable()
export class ResourceFetcherService {
  private _resourceIri!: string;
  private _loadResourceSubject = new BehaviorSubject(null);

  private _resourceSubject = new BehaviorSubject<DspResource | null>(null);
  resource$ = this._resourceSubject.asObservable();

  private _resourceIsDeletedSubject = new Subject<void>();
  resourceIsDeleted$ = this._resourceIsDeletedSubject.asObservable();

  private _subscription: Subscription | undefined;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _store: Store,
    private _translateService: TranslateService,
    private _componentCommsService: ComponentCommunicationEventService
  ) {}

  onInit(resourceIri: string) {
    this._resourceIri = resourceIri;
    this._subscription = this._loadResourceSubject
      .asObservable()
      .pipe(switchMap(() => this._getResource()))
      .subscribe(res => this._resourceSubject.next(res));

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

  onDestroy() {
    this._store.dispatch(new SetCurrentResourceAction(null));
    this._subscription?.unsubscribe();
  }

  reload() {
    this._loadResourceSubject.next(null);
  }

  resourceIsDeleted() {
    this._resourceIsDeletedSubject.next();
  }

  private _getResource() {
    return this._dspApiConnection.v2.res.getResource(this._resourceIri).pipe(
      map(response => {
        const res = new DspResource(response as ReadResource);
        res.resProps = GenerateProperty.commonProperty(res.res);

        // gather system property information
        res.systemProps = res.res.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);
        this._store.dispatch(new SetCurrentResourceAction(res));
        return res;
      })
    );
  }
}
