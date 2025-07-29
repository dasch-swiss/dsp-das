import { Component, Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { map } from 'rxjs';
import { MultipleViewerService } from '../../multiple-viewer.service';

@Component({
  selector: 'app-resource-list-item',
  template: `
    <mat-list-item
      [ngStyle]="{
        'background-color': (isHighlighted$ | async) ? '#D6E0E8' : 'inherit',
      }"
      data-cy="resource-list-item"
      (mouseenter)="showCheckbox = true"
      (mouseleave)="showCheckbox = false"
      (click)="multipleViewerService.selectOneResource(resource.id)">
      <div style="display: flex">
        <span
          style="flex: 1; display: flex; align-items: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
          >{{ resource.label }}</span
        >

        <mat-checkbox
          *ngIf="showCheckbox || multipleViewerService.selectMode"
          [checked]="isSelected$ | async"
          (change)="onCheckboxChanged($event)"
          (click)="$event.stopPropagation()" />
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

  isHighlighted$ = this.multipleViewerService.selectedResourceIds$.pipe(
    map(resourceIds => {
      if (this.multipleViewerService.selectMode) {
        return resourceIds.includes(this.resource.id);
      } else {
        return resourceIds.length > 0 && resourceIds[0] === this.resource.id;
      }
    })
  );

  isSelected$ = this.multipleViewerService.selectedResourceIds$.pipe(
    map(resourceIds => resourceIds.includes(this.resource.id) && this.multipleViewerService.selectMode)
  );

  constructor(public multipleViewerService: MultipleViewerService) {}

  onCheckboxChanged(event: MatCheckboxChange) {
    if (event.checked) {
      this.multipleViewerService.addResource(this.resource.id);
    } else {
      this.multipleViewerService.removeResource(this.resource.id);
    }
  }
}
