import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-resource-list-2',
  template: `
    <mat-selection-list>
      <app-resource-list-item *ngFor="let resource of resources" [resource]="resource" />
    </mat-selection-list>
  `,
})
export class ResourceList2Component {
  @Input({ required: true }) resources: ReadResource[] = [];
}
