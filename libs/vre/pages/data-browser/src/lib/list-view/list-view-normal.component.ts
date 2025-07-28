import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-list-view-normal',
  template: ` <app-resource-list [withMultipleSelection]="true" [resources]="resources" [selectedResourceIdx]="[]" />`,
})
export class ListViewNormalComponent {
  @Input({ required: true }) resources!: ReadResource[];
}
