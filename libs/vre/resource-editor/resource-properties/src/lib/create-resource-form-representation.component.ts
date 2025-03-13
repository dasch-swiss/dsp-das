import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Constants, CreateFileValue } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-create-resource-form-representation',
  template: `
    <app-upload-control
      *ngIf="fileRepresentation && fileRepresentation !== Constants.HasStillImageFileValue"
      [formControl]="control"
      [representation]="fileRepresentation"
      style="display: block; margin-bottom: 8px" />

    <mat-tab-group
      *ngIf="fileRepresentation === Constants.HasStillImageFileValue"
      preserveContent
      style="min-height: 320px;"
      data-cy="stillimage-tab-group">
      <mat-tab label="Upload Image">
        <app-upload-control [formControl]="control" [representation]="fileRepresentation" data-cy="upload-control" />
      </mat-tab>

      <mat-tab label="External IIIF URL">
        <app-third-part-iiif [formControl]="control" />
      </mat-tab>
    </mat-tab-group>
  `,
})
export class CreateResourceFormRepresentationComponent {
  @Input({ required: true }) control!: FormControl<CreateFileValue | null>;
  protected readonly Constants = Constants;
}
