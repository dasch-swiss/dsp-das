import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { MultipleViewerService } from '../../multiple-viewer.service';
import { CheckboxUpdate } from '../list-view.component';

@Component({
  selector: 'app-resource-list-2',
  template: `
    <mat-selection-list>
      <app-resource-list-item *ngFor="let resource of resources" [resource]="resource" />
    </mat-selection-list>
  `,
})
export class ResourceList2Component implements OnChanges {
  @Input({ required: true }) resources: ReadResource[] = [];

  constructor(public multipleViewerService: MultipleViewerService) {}

  ngOnChanges(changes: SimpleChanges) {}

  selectResource(status: CheckboxUpdate) {}
}
