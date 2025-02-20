import { Injectable } from '@angular/core';
import { Cardinality, ReadResource, ReadValue, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { BehaviorSubject } from 'rxjs';
import { FormValueArray } from './form-value-array.type';

@Injectable()
export class PropertyValueService {
  private _editModeData: { resource: ReadResource; values: ReadValue[] } | null = null;
  propertyDefinition!: ResourcePropertyDefinition;
  formArray!: FormValueArray;
  cardinality!: Cardinality;
  currentlyAdding = false;
  lastOpenedItem$ = new BehaviorSubject<number | null>(null);

  get editModeData(): { resource: ReadResource; values: ReadValue[] } | null {
    return this._editModeData;
  }

  set editModeData(data: { resource: ReadResource; values: ReadValue[] } | null) {
    this.currentlyAdding = false;
    this.lastOpenedItem$.next(null);
    this._editModeData = data;
  }

  get keepEditMode() {
    return this._editModeData === null;
  }

  toggleOpenedValue(index: number) {
    if (this.lastOpenedItem$.value === null || this.lastOpenedItem$.value !== index) {
      this.lastOpenedItem$.next(index);
    } else {
      this.lastOpenedItem$.next(null);
    }
  }
}
