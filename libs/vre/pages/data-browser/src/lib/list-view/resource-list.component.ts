import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { ResourceListItemComponent } from './resource-list-item.component';

@Component({
  selector: 'app-resource-list',
  template: `
    @for (resource of resources; track resource) {
      <app-resource-list-item [resource]="resource" />
    }
  `,
  standalone: true,
  imports: [ResourceListItemComponent],
})
export class ResourceListComponent {
  @Input({ required: true }) resources: ReadResource[] = [];
}
