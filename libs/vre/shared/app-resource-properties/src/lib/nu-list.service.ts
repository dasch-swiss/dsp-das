import { Injectable } from '@angular/core';
import { Cardinality, PropertyDefinition, ReadResource, ReadValue } from '@dasch-swiss/dsp-js';
import { BehaviorSubject } from 'rxjs';
import { FormValueArray } from './form-value-array.type';

@Injectable()
export class NuListService {
  _editModeData: { resource: ReadResource; values: ReadValue[] } | null = null;
  propertyDefinition!: PropertyDefinition;
  formArray!: FormValueArray;
  cardinality!: Cardinality;
  currentlyAdding = false;
  lastOpenedItem$ = new BehaviorSubject<number | null>(null);

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