import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MultipleViewerService {
  private _selectedResourceIdsSubject = new BehaviorSubject<string[]>([]);
  selectedResourceIds$ = this._selectedResourceIdsSubject.asObservable();

  selectMode = false;

  addResources(resourceIds: string[]) {
    const currentResources = this._selectedResourceIdsSubject.getValue();
    if (!this.selectMode && currentResources.length === 1) {
      currentResources.length = 0; // Clear the previous single selection if switching to multi-mode
    }

    resourceIds.forEach(resourceId => {
      if (!currentResources.includes(resourceId)) {
        currentResources.push(resourceId);
      }
    });
    this._selectedResourceIdsSubject.next(currentResources);

    this.selectMode = true;
  }

  removeResource(resourceId: string) {
    const currentResources = this._selectedResourceIdsSubject.getValue();

    if (currentResources.length === 1) {
      this.selectOneResource(resourceId);
      return;
    }

    const index = currentResources.indexOf(resourceId);
    if (index > -1) {
      currentResources.splice(index, 1);
      this._selectedResourceIdsSubject.next(currentResources);
    }
  }

  selectOneResource(resourceId: string) {
    this._selectedResourceIdsSubject.next([resourceId]);
    this.selectMode = false;
  }
}
