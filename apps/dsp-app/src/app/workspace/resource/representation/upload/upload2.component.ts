import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
  CreateArchiveFileValue,
  CreateAudioFileValue,
  CreateDocumentFileValue,
  CreateFileValue,
  CreateMovingImageFileValue,
  CreateStillImageFileValue,
  CreateTextFileValue,
} from '@dasch-swiss/dsp-js';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import {
  UploadedFileResponse,
  UploadFileService,
} from '@dsp-app/src/app/workspace/resource/representation/upload/upload-file.service';

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
  @Output() selectedFile = new EventEmitter<CreateFileValue>();

  @ViewChild('fileInput') fileInput;
  file: File;
  previewUrl: SafeUrl | null = null;

  constructor(
    private _notification: NotificationService,
    private _upload: UploadFileService,
    private _sanitizer: DomSanitizer
  ) {}

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
    this.uploadFile(file);
  }

  uploadFile(file: File): void {
    const formData = new FormData();

    formData.append(file.name, file);
    this._upload.upload(formData).subscribe((res: UploadedFileResponse) => {
      // prepare thumbnail url to display something after upload
      const representation = 'stillImage'; // TODO temp
      switch (representation) {
        case 'stillImage':
          const temporaryUrl = res.uploadedFiles[0].temporaryUrl;
          const thumbnailUri = '/full/256,/0/default.jpg';
          this.previewUrl = this._sanitizer.bypassSecurityTrustUrl(temporaryUrl + thumbnailUri);
          break;
        /*
                                                case 'document':
                                                  this.previewUrl = res.uploadedFiles[0].temporaryUrl;
                                                  break;

                                         */
      }

      // this.fileControl.setValue(res.uploadedFiles[0]);
      const fileValue = this.getNewValue(res.uploadedFiles[0].internalFilename);

      if (fileValue) {
        this.selectedFile.emit(fileValue);
      }
    });
    this.fileInput.nativeElement.value = null; // set the html input value to null so in case of an error the user can upload the same file again.
  }

  /**
   * create a new file value.
   */
  private getNewValue(filename: string): CreateFileValue | false {
    let fileValue:
      | CreateStillImageFileValue
      | CreateDocumentFileValue
      | CreateAudioFileValue
      | CreateArchiveFileValue
      | CreateMovingImageFileValue
      | CreateTextFileValue;

    switch ('stillImage') {
      case 'stillImage':
        fileValue = new CreateStillImageFileValue();
        break;
      /*
                                                case 'document':
                                                  fileValue = new CreateDocumentFileValue();
                                                  break;

                                                case 'audio':
                                                  fileValue = new CreateAudioFileValue();
                                                  break;

                                                case 'movingImage':
                                                  fileValue = new CreateMovingImageFileValue();
                                                  break;

                                                case 'archive':
                                                  fileValue = new CreateArchiveFileValue();
                                                  break;

                                                case 'text':
                                                  fileValue = new CreateTextFileValue();
                                                  break;
                                          */
      default:
        break;
    }

    fileValue.filename = filename;

    return fileValue;
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
