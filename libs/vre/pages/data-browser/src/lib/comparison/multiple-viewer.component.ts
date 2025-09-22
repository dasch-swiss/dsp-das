import { Component } from '@angular/core';
import { map } from 'rxjs';
import { MultipleViewerService } from './multiple-viewer.service';

@Component({
  selector: 'app-multiple-viewer',
  template: `
    @if (selectedResourceIds$ | async; as selectedResourceIds) {
      @if (selectedResourceIds.length === 0) {
        <div class="centered empty-state">
          <div class="empty-content">
            <mat-icon style="font-size">search</mat-icon>
            <h3>Select resources to compare</h3>
            <p>Choose one or more resources from the left panel to display and compare them here.</p>
          </div>
        </div>
      } @else if (selectedResourceIds.length <= MAX_RESOURCES) {
        <app-comparison [resourceIds]="selectedResourceIds" />
      } @else if (selectedResourceIds.length > MAX_RESOURCES) {
        <div class="centered">
          <div class="error-content">
            <mat-icon class="error-icon">warning</mat-icon>
            <h3>Too many resources selected</h3>
            <p>Maximum {{ MAX_RESOURCES }} resources can be compared at once. Please deselect some resources.</p>
          </div>
        </div>
      }
    }
  `,
  styles: [
    `
      .centered {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class MultipleViewerComponent {
  readonly MAX_RESOURCES = 6;

  selectedResourceIds$ = this.multipleViewerService.selectedResources$.pipe(map(resources => resources.map(r => r.id)));

  constructor(public multipleViewerService: MultipleViewerService) {}
}
