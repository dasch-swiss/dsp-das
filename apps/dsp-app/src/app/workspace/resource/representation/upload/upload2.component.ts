import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';

@Component({
  selector: 'app-upload-2',
  template: `
    <div *ngIf="!file; else showFileTemplate" appDragDrop (click)="fileInput.click()" (fileDropped)="addFile($event)">
      <input hidden type="file" (change)="addFile($event)" #fileInput />
      <div>Drag and drop or click to upload</div>
      <div class="mat-subtitle-2">The following file types are supported: >{{ allowedFileTypes.join(',') }}</div>
    </div>

    <ng-template #showFileTemplate>
      <div *ngIf="previewUrl">
        <img [src]="previewUrl" alt="File Preview" style="max-width: 100%; max-height: 200px;" />
      </div>
      <div
        style="display: grid; grid-template-columns: auto auto auto auto; grid-gap: 10px; align-items: center; margin-top: 24px">
        <span>Name</span>
        <span>Size</span>
        <span>Last Modified Date</span>
        <span>Delete</span>
        <span>{{ file.name }}</span>
        <span>{{ Math.floor(file.size / 1000) }} kb</span>
        <span>{{ file.lastModified | date }}</span>
        <button mat-icon-button (click)="removeFile()">
          <mat-icon>delete</mat-icon>
        </button>
      </div>
    </ng-template>
  `,
})
export class Upload2Component {
  @Input() allowedFileTypes: string[];
  @Output() selectedFile = new EventEmitter<File>();

  file: File;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(private _notification: NotificationService) {}

  addFile(event: any) {
    console.log(event, '');
    const file: File = event[0];

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
