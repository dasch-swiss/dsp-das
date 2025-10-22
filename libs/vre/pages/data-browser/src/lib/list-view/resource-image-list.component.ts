import { Component, Input, OnInit } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-resource-image-list',
  template: `
    @for (resource of resources; track resource) {
      <app-resource-list-image-item [resource]="resource" />
    }
  `,
  standalone: false,
  styles: [
    `
      :host {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    `,
  ],
})
export class ResourceImageListComponent implements OnInit {
  @Input({ required: true }) resources: ReadResource[] = [];

  ngOnInit() {
    console.log(this.resources);
  }
}
