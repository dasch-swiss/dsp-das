import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NuListService {
  _editModeData: { resource: any; prop: any } | null = null;
  currentlyAdding = false;
  lastOpenedItem$ = new BehaviorSubject<number | null>(null);
  get keepEditMode() {
    return this._editModeData === null;
  }

  toggle(index: number) {
    if (this.lastOpenedItem$.value === null || this.lastOpenedItem$.value !== index) {
      this.lastOpenedItem$.next(index);
    } else {
      this.lastOpenedItem$.next(null);
    }
  }
}
