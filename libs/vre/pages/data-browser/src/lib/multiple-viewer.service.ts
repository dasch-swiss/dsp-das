import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MultipleViewerService {
  private _selectedResourceIdsSubject = new BehaviorSubject<string[]>([]);
  selectedResourceIds$ = this._selectedResourceIdsSubject.asObservable();

  activatedResourceId?: string;

  addResource(resourceId: string) {
    const currentResources = this._selectedResourceIdsSubject.getValue();
    if (!currentResources.includes(resourceId)) {
      currentResources.push(resourceId);
      this._selectedResourceIdsSubject.next(currentResources);
    }
  }

  removeResource(resourceId: string) {
    const currentResources = this._selectedResourceIdsSubject.getValue();
    const index = currentResources.indexOf(resourceId);
    if (index > -1) {
      currentResources.splice(index, 1);
      this._selectedResourceIdsSubject.next(currentResources);
    }

    if (currentResources.length === 1) {
      console.log('got one', currentResources);
      this.activatedResourceId = currentResources[0]; // Reset activated resource if no resources left
    }
  }

  selectOneResource(resourceId: string) {
    this.activatedResourceId = resourceId;
  }
}
