import { Component } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { MultipleViewerService } from './multiple-viewer.service';

@Component({
  selector: 'app-multiple-viewer-2',
  template: `
    <ng-container *ngIf="multipleViewerService.selectedResourceIds$ | async as selectedResources">
      <app-comparison *ngIf="selectedResources.length <= MAX_RESOURCES" [resourceIds]="selectedResources" />
      <div *ngIf="selectedResources.length > MAX_RESOURCES">Too many resources</div>
    </ng-container>
  `,
})
export class MultipleViewer2Component {
  readonly MAX_RESOURCES = 3;

  constructor(public multipleViewerService: MultipleViewerService) {}

  updateResourceCount(resource: ReadResource) {
    // TODO
  }
}
