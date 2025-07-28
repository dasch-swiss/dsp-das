import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-list-view-normal',
  template: ` <app-resource-list-2 [resources]="resources" />`,
})
export class ListViewNormalComponent {
  @Input({ required: true }) resources!: ReadResource[];
}
