import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FileRepresentationType } from '@dasch-swiss/vre/resource-editor/representations';

@Component({
  selector: 'app-create-resource-form-image',
  template: ` <app-create-resource-form-row [label]="'Image'" style="display: block; margin-bottom: 16px">
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
  </app-create-resource-form-row>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateResourceFormImageComponent {
  @Input({ required: true }) control!: FormControl<string | null>;
  @Input({ required: true }) fileRepresentation!: FileRepresentationType;

  isLocal = true;
}
