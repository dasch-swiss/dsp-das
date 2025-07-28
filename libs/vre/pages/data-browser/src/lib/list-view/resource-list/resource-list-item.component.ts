import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { MultipleViewerService } from '../../multiple-viewer.service';

@Component({
  selector: 'app-resource-list-item',
  template: `
    <mat-list-item
      data-cy="resource-list-item"
      (mouseenter)="showCheckbox = true"
      (mouseleave)="showCheckbox = false"
      *ngIf="multipleViewerService.selectedResources$ | async as selectedResources">
      <div style="display: flex">
        <span style="flex: 1; display: flex; align-items: center">{{ resource.label }}</span>
        <mat-checkbox *ngIf="showCheckbox || selectedResources.length > 0" (change)="selectResource($event.checked)" />
      </div>
    </mat-list-item>
  `,
  styles: [
    `
      mat-list-item {
        border-bottom: 1px solid #ebebeb;
      }
    `,
  ],
})
export class ResourceListItemComponent {
  @Input({ required: true }) resource!: ReadResource;

  showCheckbox = false;

  constructor(public multipleViewerService: MultipleViewerService) {}

  selectResource(checked: boolean) {
    if (checked) {
      this.multipleViewerService.addResource(this.resource.id);
    } else {
      this.multipleViewerService.removeResource(this.resource.id);
    }
  }
}
