import { Component } from '@angular/core';
import { map } from 'rxjs';
import { MultipleViewerService } from './multiple-viewer.service';

@Component({
  selector: 'app-multiple-viewer-2',
  template: `
    <ng-container *ngIf="selectedResourceIds$ | async as selectedResourceIds">
      <app-comparison *ngIf="selectedResourceIds.length <= MAX_RESOURCES" [resourceIds]="selectedResourceIds" />
      <div
        *ngIf="selectedResourceIds.length > MAX_RESOURCES"
        style="height: 100%; display: flex; align-items: center; justify-content: center">
        Too many resources are selected to be displayed.
      </div>
    </ng-container>
  `,
})
export class MultipleViewer2Component {
  readonly MAX_RESOURCES = 6;

  selectedResourceIds$ = this.multipleViewerService.selectedResources$.pipe(map(resources => resources.map(r => r.id)));

  constructor(public multipleViewerService: MultipleViewerService) {}
}
