import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileForm } from './file-form.type';

@Component({
  selector: 'app-create-resource-form-file',
  template: ` <app-create-resource-form-representation
      [control]="form.controls.link"
      [fileRepresentation]="fileRepresentation"
      (externalImageSelected)="externalImageSelected.emit($event)" />

    <app-resource-form-legal [formGroup]="form.controls.legal" [projectShortcode]="projectShortcode" />`,
})
export class CreateResourceFormFileComponent {
  @Input({ required: true }) form!: FileForm;
  @Input({ required: true }) projectShortcode!: string;
  @Input({ required: true }) fileRepresentation!: string;
  @Output() externalImageSelected = new EventEmitter<boolean>();
}
