import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpdateFileValue } from '@dasch-swiss/dsp-js';
import { UploadComponent } from '../upload/upload.component';

export interface ReplaceFileDialogProps {
  representation: 'stillImage' | 'movingImage' | 'audio' | 'document' | 'text' | 'archive';
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
  @Output() closeDialog: EventEmitter<UpdateFileValue> = new EventEmitter<UpdateFileValue>();
  @ViewChild('upload') uploadComponent!: UploadComponent;

  fileValue?: UpdateFileValue;
  warningMessages: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ReplaceFileDialogProps,
    public dialogRef: MatDialogRef<ReplaceFileDialogComponent>
  ) {}

  ngOnInit(): void {
    this._generateWarningMessage(this.data.representation);
  }

  setFileValue(file: UpdateFileValue) {
    this.fileValue = file;
  }

  saveFile() {
    const updateVal = this.uploadComponent.getUpdatedValue(this.data.propId);

    if (updateVal instanceof UpdateFileValue) {
      updateVal.filename = this.fileValue.filename;
      updateVal.id = this.data.propId;
      this.closeDialog.emit(updateVal);
    } else {
      console.error('expected UpdateFileValue, got: ', updateVal);
    }
  }

  // generate the warning message strings with the correct representation type
  _generateWarningMessage(representationType: string) {
    if (representationType === undefined) {
      this.warningMessages.push('File will be replaced.');
      this.warningMessages.push('Please note that you are about to replace the file');
    }

    let repType = representationType;

    if (representationType === 'stillImage' || representationType === 'movingImage') {
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
