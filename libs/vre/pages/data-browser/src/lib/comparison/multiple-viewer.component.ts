import { Component } from '@angular/core';
import { map } from 'rxjs';
import { MultipleViewerService } from './multiple-viewer.service';

@Component({
  selector: 'app-multiple-viewer',
  template: `
    <ng-container *ngIf="selectedResourceIds$ | async as selectedResourceIds">
      <app-comparison *ngIf="selectedResourceIds.length <= MAX_RESOURCES" [resourceIds]="selectedResourceIds" />
      <div style="height: 100%; display: flex; align-items: center; justify-content: center">
        <ng-container *ngIf="selectedResourceIds.length > MAX_RESOURCES">
          Too many resources are selected to be displayed.
        </ng-container>

        <ng-container *ngIf="selectedResourceIds.length === 0">
          Select a resource on the left panel to display.
        </ng-container>
      </div>
    </ng-container>
  `,
})
export class MultipleViewerComponent {
  readonly MAX_RESOURCES = 6;

  selectedResourceIds$ = this.multipleViewerService.selectedResources$.pipe(map(resources => resources.map(r => r.id)));

  constructor(public multipleViewerService: MultipleViewerService) {}
}
