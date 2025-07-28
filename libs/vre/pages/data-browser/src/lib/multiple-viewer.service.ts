import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MultipleViewerService {
  private _selectedResourcesSubject = new BehaviorSubject<string[]>([]);
  selectedResources$ = this._selectedResourcesSubject.asObservable();

  activatedResourceId?: string;

  addResource(resourceId: string) {
    const currentResources = this._selectedResourcesSubject.getValue();
    if (!currentResources.includes(resourceId)) {
      currentResources.push(resourceId);
      this._selectedResourcesSubject.next(currentResources);
    }
  }

  removeResource(resourceId: string) {
    const currentResources = this._selectedResourcesSubject.getValue();
    const index = currentResources.indexOf(resourceId);
    if (index > -1) {
      currentResources.splice(index, 1);
      this._selectedResourcesSubject.next(currentResources);
    }
  }

  selectOneResource(resourceId: string) {
    this.activatedResourceId = resourceId;
  }
}
