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
      <span (click)="selectAll()">Select all</span>
    </div>
  `,
})
export class ResourceListSelectionComponent {
  @Input({ required: true }) resources!: ReadResource[];

  count$ = this.multipleViewerService.selectedResourceIds$.pipe(map(ids => ids.length));
  showCreateLink$ = this.count$.pipe(map(count => count > 1));

  constructor(public multipleViewerService: MultipleViewerService) {}

  selectAll() {
    this.multipleViewerService.addResources(this.resources.map(resource => resource.id));
  }
}
