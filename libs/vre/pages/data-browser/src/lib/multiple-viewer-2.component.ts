import { Component } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { MultipleViewerService } from './multiple-viewer.service';

@Component({
  selector: 'app-multiple-viewer-2',
  template: `
    <ng-container *ngIf="multipleViewerService.selectedResourceIds$ | async as selectedResources">
      <app-comparison *ngIf="selectedResources.length > 1; else singleResourceTpl" [resourceIds]="selectedResources" />
    </ng-container>

    <ng-template #singleResourceTpl>
      <app-resource-fetcher
        *ngIf="multipleViewerService.activatedResourceId as resourceIri"
        [resourceIri]="resourceIri"
        (afterResourceDeleted)="updateResourceCount($event)" />
    </ng-template>
  `,
})
export class MultipleViewer2Component {
  constructor(public multipleViewerService: MultipleViewerService) {}

  updateResourceCount(resource: ReadResource) {
    // TODO
  }
}
