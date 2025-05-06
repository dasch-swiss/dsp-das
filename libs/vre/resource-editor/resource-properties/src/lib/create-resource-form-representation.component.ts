import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Constants } from '@dasch-swiss/dsp-js';
import { FileRepresentationType } from '@dasch-swiss/vre/resource-editor/representations';

@Component({
  selector: 'app-create-resource-form-representation',
  template: `
    <app-create-resource-form-row
      [label]="'File'"
      [tooltip]="'File'"
      *ngIf="fileRepresentation !== Constants.HasStillImageFileValue; else stillImageTpl">
      <app-upload-control
        [formControl]="control"
        [representation]="fileRepresentation"
        style="display: block; margin-bottom: 16px" />
    </app-create-resource-form-row>

    <ng-template #stillImageTpl>
      <app-create-resource-form-row [label]="'Image'" [tooltip]="'Image'">
        <mat-chip-listbox aria-label="File source" style="margin-bottom: 8px; margin-top: 8px">
          <mat-chip-option (click)="isLocal = true" [selected]="isLocal">Upload file</mat-chip-option>
          <mat-chip-option (click)="isLocal = false" [selected]="!isLocal">Link external IIIF image</mat-chip-option>
        </mat-chip-listbox>

        <app-upload-control
          *ngIf="isLocal"
          [formControl]="control"
          [representation]="fileRepresentation"
          data-cy="upload-control" />
        <app-third-part-iiif [control]="control" *ngIf="!isLocal" />
      </app-create-resource-form-row>
    </ng-template>
  `,
  styles: [
    `
      :host ::ng-deep .mat-mdc-tab-body {
        padding-top: 24px;
      }
    `,
  ],
})
export class CreateResourceFormRepresentationComponent {
  @Input({ required: true }) control!: FormControl<string | null>;
  @Input({ required: true }) fileRepresentation!: FileRepresentationType;
  @Output() externalImageSelected = new EventEmitter<boolean>();
  protected readonly Constants = Constants;
  isLocal = true;
}
