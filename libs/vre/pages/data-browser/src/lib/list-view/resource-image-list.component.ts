import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { ResourceListImageItemComponent } from './resource-list-image-item.component';

/** Grid counterpart of `ResourceListComponent`: the same resources rendered as thumbnails. */
@Component({
  selector: 'app-resource-image-list',
  template: `
    @for (resource of resources; track resource.id) {
      <app-resource-list-image-item [resource]="resource" data-cy="resource-image-list-item" />
    }
  `,
  styles: [
    `
      :host {
        display: grid;
        /* Tight gutters and square tiles: the mosaic is the point, so the gaps stay
           hairline rather than framing each thumbnail as a card. */
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 3px;
        padding: 3px;
      }
    `,
  ],
  imports: [ResourceListImageItemComponent],
})
export class ResourceImageListComponent {
  @Input({ required: true }) resources: ReadResource[] = [];
}
