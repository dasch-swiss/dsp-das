import { Component, Input } from '@angular/core';
import { FileRepresentationType } from '@dasch-swiss/vre/resource-editor/representations';
import { CreateResourceFormInterface } from './create-resource-form.interface';

@Component({
  selector: 'app-create-resource-form-file',
  template: `
    <app-create-resource-form-representation
      [control]="(control?.controls)!.link"
      [fileRepresentation]="fileRepresentation" />

    <app-create-resource-form-legal [formGroup]="control?.controls.legal" />
  `,
})
export class CreateResourceFormFileComponent {
  @Input({ required: true }) control!: CreateResourceFormInterface['file'];
  @Input({ required: true }) fileRepresentation!: FileRepresentationType;
}
