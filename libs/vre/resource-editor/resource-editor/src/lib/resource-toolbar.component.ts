import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-resource-toolbar',
  template: `
    <app-resource-actions [resource]="resource">
      <app-resource-more-menu [resource]="resource" />
    </app-resource-actions>
  `,
  standalone: false,
})
export class ResourceToolbarComponent {
  @Input({ required: true }) resource!: ReadResource;
}
