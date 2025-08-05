import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-resource-list',
  template: `
    <mat-selection-list>
      <app-resource-list-item *ngFor="let resource of resources" [resource]="resource" />
    </mat-selection-list>
  `,
})
export class ResourceListComponent {
  @Input({ required: true }) resources: ReadResource[] = [];
}
