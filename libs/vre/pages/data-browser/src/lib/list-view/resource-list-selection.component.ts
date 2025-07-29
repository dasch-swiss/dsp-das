import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { map } from 'rxjs';
import { MultipleViewerService } from '../multiple-viewer.service';

@Component({
  selector: 'app-resource-list-selection',
  template: `
    <div style="background: #ebebeb; padding: 16px; display: flex; justify-content: space-between">
      <div>
        <div>{{ count$ | async }} resources selected</div>
        <div *ngIf="showCreateLink$ | async">Create a link</div>
      </div>
      <button mat-button *ngIf="allSelected$ | async; else selectAllTpl" (click)="unselectAll()">Unselect all</button>
    </div>

    <ng-template #selectAllTpl>
      <button mat-button (click)="selectAll()">Select all</button>
    </ng-template>
  `,
})
export class ResourceListSelectionComponent {
  @Input({ required: true }) resources!: ReadResource[];

  count$ = this.multipleViewerService.selectedResourceIds$.pipe(map(ids => ids.length));
  showCreateLink$ = this.count$.pipe(map(count => count > 1));

  allSelected$ = this.multipleViewerService.selectedResourceIds$.pipe(
    map(ids => this.resources.every(resource => ids.includes(resource.id)))
  );

  constructor(public multipleViewerService: MultipleViewerService) {}

  selectAll() {
    this.multipleViewerService.addResources(this.resources.map(resource => resource.id));
  }

  unselectAll() {
    this.multipleViewerService.removeResources(this.resources.map(resource => resource.id));
  }
}
