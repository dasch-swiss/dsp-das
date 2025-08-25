import { Injectable } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MultipleViewerService {
  private _selectedResourcesSubject = new BehaviorSubject<ReadResource[]>([]);
  selectedResources$ = this._selectedResourcesSubject.asObservable();

  selectMode = false;

  searchKeyword?: string;

  addResources(resources: ReadResource[]) {
    const currentResources = this._selectedResourcesSubject.getValue();
    if (!this.selectMode && currentResources.length === 1) {
      currentResources.length = 0; // Clear the previous single selection if switching to multi-mode
    }

    resources.forEach(resource => {
      if (!currentResources.includes(resource)) {
        currentResources.push(resource);
      }
    });
    this._selectedResourcesSubject.next(currentResources);

    this.selectMode = true;
  }

  removeResources(resources: ReadResource[]) {
    const currentResources = this._selectedResourcesSubject.getValue();

    resources.forEach(resource => {
      const index = currentResources.indexOf(resource);
      if (index <= -1) {
        // does not exist
        return;
      }

      currentResources.splice(index, 1);
    });

    this._selectedResourcesSubject.next(currentResources);
    this.selectMode = currentResources.length > 0;
  }

  selectOneResource(resource: ReadResource) {
    this._selectedResourcesSubject.next([resource]);
    this.selectMode = false;
  }

  reset() {
    this.selectMode = false;
    this._selectedResourcesSubject.next([]);
  }
}
