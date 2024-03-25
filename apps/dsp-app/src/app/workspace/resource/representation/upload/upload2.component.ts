import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';

@Component({
  selector: 'app-upload-2',
  template: `
    <div
      *ngIf="!file; else showFileTemplate"
      appDragDrop
      (click)="fileInput.click()"
      (fileDropped)="addFile($event.item(0))"
      style="text-align: center;
    padding: 16px; cursor: pointer">
      <input hidden type="file" (change)="addFileFromClick($event)" #fileInput />
      <mat-icon>cloud_upload</mat-icon>
      <div>Drag and drop or click to upload</div>
      <div class="mat-subtitle-2">The following file types are supported: >{{ allowedFileTypes.join(',') }}</div>
    </div>

    <ng-template #showFileTemplate>
      <div *ngIf="previewUrl">
        <img [src]="previewUrl" alt="File Preview" style="max-width: 100%; max-height: 200px;" />
      </div>
      <table style="border: 1px solid; width: 100%">
        <tr style="background: lightblue">
          <th>Name</th>
          <th>Size</th>
          <th>Last Modified Date</th>
          <th>Delete</th>
        </tr>
        <tr>
          <td>{{ file.name }}</td>
          <td>{{ Math.floor(file.size / 1000) }} kb</td>
          <td>{{ file.lastModified | date }}</td>
          <td>
            <button mat-icon-button (click)="removeFile()">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </tr>
      </table>
    </ng-template>
  `,
  styles: ['td {padding: 8px; text-align: center}'],
})
export class Upload2Component {
  @Input() allowedFileTypes: string[];
  @Output() selectedFile = new EventEmitter<File>();

  file: File;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(private _notification: NotificationService) {}

  addFileFromClick(event: any) {
    this.addFile(event.target.files[0]);
  }

  addFile(file: File) {
    console.log(file, 'file');
    if (!this.allowedFileTypes.includes(file.type)) {
      this._notification.openSnackBar(`This file type (${file.type}) is not supported`);
      return;
    }

    if (file.type.startsWith('image')) {
      this.previewThumbnail(file);
    }
    this.file = file;
    this.selectedFile.emit(file);
  }

  removeFile() {
    this.file = null;
  }

  private previewThumbnail(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
  }

  protected readonly Math = Math;
}
