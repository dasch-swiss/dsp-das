import { Component, Input, OnChanges } from '@angular/core';
import { FileRepresentation, getFileValue } from '@dasch-swiss/vre/resource-editor/representations';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-resource-file-value',
  template: ` <app-resource-representation [resource]="resource" [representationToDisplay]="representationToDisplay" />
    <app-resource-legal [resource]="resource" [representationToDisplay]="representationToDisplay" />`,
})
export class ResourceFileValueComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;
  representationToDisplay!: FileRepresentation;

  ngOnChanges() {
    this.representationToDisplay = new FileRepresentation(getFileValue(this.resource)!);
  }
}
