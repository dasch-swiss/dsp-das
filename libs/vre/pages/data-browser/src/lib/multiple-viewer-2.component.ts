import { Component } from '@angular/core';
import { MultipleViewerService } from './multiple-viewer.service';

@Component({
  selector: 'app-multiple-viewer-2',
  template: `
    <ng-container *ngIf="multipleViewerService.selectedResourceIds$ | async as selectedResources">
      <app-comparison *ngIf="selectedResources.length <= MAX_RESOURCES" [resourceIds]="selectedResources" />
      <div
        *ngIf="selectedResources.length > MAX_RESOURCES"
        style="height: 100%; display: flex; align-items: center; justify-content: center">
        Too many resources are selected to be displayed.
      </div>
    </ng-container>
  `,
})
export class MultipleViewer2Component {
  readonly MAX_RESOURCES = 3;

  constructor(public multipleViewerService: MultipleViewerService) {}
}
