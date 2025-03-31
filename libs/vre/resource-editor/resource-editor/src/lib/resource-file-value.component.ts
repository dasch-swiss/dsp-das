import { Component, Input } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-resource-file-value',
  template: ``,
})
export class ResourceFileValueComponent {
  @Input({ required: true }) resource!: DspResource;
}
