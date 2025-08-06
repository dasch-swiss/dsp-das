import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { map } from 'rxjs';
import { MultipleViewerService } from '../comparison/multiple-viewer.service';

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
      (click)="multipleViewerService.selectOneResource(resource)">
      <div style="display: flex">
        <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
          <div class="mat-caption">{{ resource.resourceClassLabel }}</div>
          <div>{{ resource.label }}</div>
        </div>

        <mat-checkbox
          *ngIf="showCheckbox || multipleViewerService.selectMode"
          [checked]="isSelected$ | async"
          (change)="onCheckboxChanged($event)"
          (click)="$event.stopPropagation()" />
      </div>
    </mat-list-item>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      mat-list-item {
        border-bottom: 1px solid #ebebeb;
        padding: 32px 16px;
      }
    `,
  ],
})
export class ResourceListItemComponent {
  @Input({ required: true }) resource!: ReadResource;

  showCheckbox = false;

  isHighlighted$ = this.multipleViewerService.selectedResources$.pipe(
    map(resources => {
      if (this.multipleViewerService.selectMode) {
        return resources.includes(this.resource);
      } else {
        return resources.length > 0 && resources[0] === this.resource;
      }
    })
  );

  isSelected$ = this.multipleViewerService.selectedResources$.pipe(
    map(resources => resources.map(r => r.id).includes(this.resource.id) && this.multipleViewerService.selectMode)
  );

  constructor(public multipleViewerService: MultipleViewerService) {}

  onCheckboxChanged(event: MatCheckboxChange) {
    if (event.checked) {
      this.multipleViewerService.addResources([this.resource]);
    } else {
      this.multipleViewerService.removeResources([this.resource]);
    }
  }
}
