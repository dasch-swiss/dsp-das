import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UploadFileService } from '@dasch-swiss/vre/resource-editor/representations';

@Component({
  selector: 'app-uploaded-file',
  template: ` <mat-card *ngIf="fileToUpload$ | async as fileToUpload">
    <mat-card-content style="display: flex; align-items: center">
      <mat-icon color="primary">description</mat-icon>
      <div style="flex: 1; margin-left: 8px">{{ fileToUpload.originalFilename }}</div>
      <button mat-icon-button (click)="removeFile.emit()">
        <mat-icon>cancel</mat-icon>
      </button>
    </mat-card-content>
  </mat-card>`,
})
export class UploadedFileComponent {
  @Input({ required: true }) internalFilename!: string;
  @Output() removeFile = new EventEmitter<void>();

  fileToUpload$ = this._uploadFileService.getFileInfo('7720nz5nV9p-FtmN5dmYUL8', '0803'); // TODO

  constructor(private _uploadFileService: UploadFileService) {}
}
