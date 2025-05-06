import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipListbox, MatChipListboxChange } from '@angular/material/chips';
import { FileRepresentationType } from '@dasch-swiss/vre/resource-editor/representations';

@Component({
  selector: 'app-create-resource-form-image',
  template: ` <app-create-resource-form-row [label]="'Image'" style="display: block; margin-bottom: 16px">
    <mat-chip-listbox
      aria-label="File source"
      style="margin-bottom: 8px; margin-top: 8px"
      [required]="true"
      (change)="onChange($event)"
      [value]="isUploadFileTab">
      <mat-chip-option [value]="true"> Upload file</mat-chip-option>
      <mat-chip-option [value]="false"> Link external IIIF image</mat-chip-option>
    </mat-chip-listbox>

    <app-upload-control
      *ngIf="isUploadFileTab"
      [formControl]="control"
      [representation]="fileRepresentation"
      data-cy="upload-control" />
    <app-third-part-iiif [control]="control" *ngIf="!isUploadFileTab" />
  </app-create-resource-form-row>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateResourceFormImageComponent {
  @Input({ required: true }) control!: FormControl<string | null>;
  @Input({ required: true }) fileRepresentation!: FileRepresentationType;
  @ViewChild(MatChipListbox) matChipListbox!: MatChipListbox;

  isUploadFileTab = true;

  cachedValue: { upload?: string; external?: string } = { upload: undefined, external: undefined };

  onChange(event: MatChipListboxChange) {
    if (event.value === undefined) {
      this.matChipListbox.value = this.isUploadFileTab;
      return;
    }

    if (event.value === true) {
      // upload file case
      this.cachedValue.external = this.control.value!;
    } else {
      this.cachedValue.upload = this.control.value!;
    }
    this.isUploadFileTab = event.value;

    const patchedValue = event.value === true ? this.cachedValue.upload : this.cachedValue.external;
    this.control.setValue(patchedValue ?? null);
  }
}
