import { Component } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { MultipleViewerService } from './multiple-viewer.service';

@Component({
  selector: 'app-multiple-viewer-2',
  template: `
    <ng-container *ngIf="multipleViewerService.selectedResourceIds$ | async as selectedResources">
      <app-comparison [resourceIds]="selectedResources" />
    </ng-container>
  `,
})
export class MultipleViewer2Component {
  constructor(public multipleViewerService: MultipleViewerService) {}

  updateResourceCount(resource: ReadResource) {
    // TODO
  }
}
