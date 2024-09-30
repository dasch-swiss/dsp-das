import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpdateFileValue } from '@dasch-swiss/dsp-js/src/models/v2/resources/values/update/update-file-value';
import { FileRepresentationType } from '@dasch-swiss/vre/shared/app-resource-properties';

export interface ReplaceFileDialogProps {
  representation: FileRepresentationType;
  propId: string;
  projectUuid: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-replace-file-dialog',
  templateUrl: './replace-file-dialog.component.html',
  styleUrls: ['./replace-file-dialog.component.scss'],
})
export class ReplaceFileDialogComponent implements OnInit {
  warningMessages: string[] = [];
  form = this._fb.control<UpdateFileValue | null>(null);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ReplaceFileDialogProps,
    public dialogRef: MatDialogRef<ReplaceFileDialogComponent>,
    private _fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this._generateWarningMessage(this.data.representation);
  }

  saveFile() {
    this.dialogRef.close(this.form.getRawValue());
  }

  private _generateWarningMessage(representationType: string) {
    let repType = representationType;

    if (representationType === 'stillImag   e' || representationType === 'movingImage') {
      switch (representationType) {
        case 'stillImage':
          repType = 'image';
          break;

        case 'movingImage':
          repType = 'video';
          break;
      }
    }

    const capitalized = repType[0].toUpperCase() + repType.substring(1).toLowerCase();

    this.warningMessages.push(`${capitalized} will be replaced.`);
    this.warningMessages.push(`Please note that you are about to replace the ${repType}.`);
  }
}
