import { Inject, Injectable } from '@angular/core';
import {
  Cardinality,
  KnoraApiConnection,
  ListNodeV2WithAllLanguages,
  ReadResource,
  ReadValue,
  ResourcePropertyDefinitionWithAllLanguages,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';

@Injectable()
export class PropertyValueService {
  private _editModeData!: { resource: ReadResource; values: ReadValue[] };
  propertyDefinition!: ResourcePropertyDefinitionWithAllLanguages;
  cardinality!: Cardinality;
  lastOpenedItem$ = new BehaviorSubject<number | null>(null);

  /**
   * One shared whole-list fetch for this property, so all of its list values resolve against a
   * single /v2/lists request instead of one per value. Keyed by root IRI to guard against the
   * (unexpected) case of the property definition changing under a live service instance.
   */
  private _listByRoot: { [rootIri: string]: Observable<ListNodeV2WithAllLanguages> } = {};

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  get editModeData(): { resource: ReadResource; values: ReadValue[] } {
    return this._editModeData;
  }

  set editModeData(data: { resource: ReadResource; values: ReadValue[] }) {
    this.lastOpenedItem$.next(null);
    this._editModeData = data;
  }

  /**
   * Returns the list rooted at `rootIri`, fetched once and shared across all of this property's
   * list values. The service is provided per property (see PropertyValuesComponent), so the
   * cache lifetime never exceeds a single property's viewer lifetime.
   */
  getList$(rootIri: string): Observable<ListNodeV2WithAllLanguages> {
    if (this._listByRoot[rootIri] === undefined) {
      this._listByRoot[rootIri] = this._dspApiConnection.v2.list
        .getListWithAllLanguages(rootIri)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }
    return this._listByRoot[rootIri];
  }

  toggleOpenedValue(index: number) {
    if (this.lastOpenedItem$.value === null || this.lastOpenedItem$.value !== index) {
      this.lastOpenedItem$.next(index);
    } else {
      this.lastOpenedItem$.next(null);
    }
  }
}
