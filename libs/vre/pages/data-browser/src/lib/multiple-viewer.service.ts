import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MultipleViewerService {
  private _selectedResourceIdsSubject = new BehaviorSubject<string[]>([]);
  selectedResourceIds$ = this._selectedResourceIdsSubject.asObservable();

  multiMode = false;

  addResource(resourceId: string) {
    const currentResources = this._selectedResourceIdsSubject.getValue();
    if (!this.multiMode && currentResources.length === 1) {
      currentResources.length = 0; // Clear the previous single selection if switching to multi-mode
    }

    if (!currentResources.includes(resourceId)) {
      currentResources.push(resourceId);
      this._selectedResourceIdsSubject.next(currentResources);
    }

    this.multiMode = true;
  }

  removeResource(resourceId: string) {
    const currentResources = this._selectedResourceIdsSubject.getValue();
    const index = currentResources.indexOf(resourceId);
    if (index > -1) {
      currentResources.splice(index, 1);
      this._selectedResourceIdsSubject.next(currentResources);
    }

    this.multiMode = true;
  }

  selectOneResource(resourceId: string) {
    this._selectedResourceIdsSubject.next([resourceId]);
    this.multiMode = false;
  }
}
