import { ChangeDetectorRef, Component, ElementRef, Input, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Constants } from '@dasch-swiss/dsp-js';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { fileValueMapping } from '@dsp-app/src/app/workspace/resource/representation/upload/file-mappings';
import { FileRepresentationType } from '@dsp-app/src/app/workspace/resource/representation/upload/file-representation.type';
import {
  UploadedFileResponse,
  UploadFileService,
} from '@dsp-app/src/app/workspace/resource/representation/upload/upload-file.service';

@Component({
  selector: 'app-upload-2',
  template: `
    <div
      *ngIf="ngControl.value === null; else showFileTemplate"
      appDragDrop
      (click)="fileInput.click()"
      (fileDropped)="addFile($event.item(0))"
      style="text-align: center;
    padding: 16px; cursor: pointer">
      <input hidden type="file" (change)="addFileFromClick($event)" #fileInput />
      <mat-icon>cloud_upload</mat-icon>
      <div>Drag and drop or click to upload</div>
      <div class="mat-subtitle-2">The following file types are supported: <br />{{ allowedFileTypes.join(', ') }}</div>
    </div>
    <mat-error *ngIf="ngControl.touched && ngControl.errors">{{ ngControl.errors | humanReadableError }}</mat-error>

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
          <td>{{ fileToUpload.name }}</td>
          <td>{{ Math.floor(fileToUpload.size / 1000) }} kb</td>
          <td>{{ fileToUpload.lastModified | date }}</td>
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
export class Upload2Component implements ControlValueAccessor {
  @Input({ required: true }) representation: FileRepresentationType;
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  readonly Math = Math;

  previewUrl: SafeUrl | null = null;
  fileToUpload: File;

  onChange: Function;
  onTouched: Function;

  get allowedFileTypes() {
    return fileValueMapping.get(this.representation).fileTypes;
  }

  constructor(
    private _notification: NotificationService,
    private _upload: UploadFileService,
    private _sanitizer: DomSanitizer,
    private _cdr: ChangeDetectorRef,
    @Self() public ngControl: NgControl
  ) {
    ngControl.valueAccessor = this;
  }

  writeValue(value: null): void {}

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  addFileFromClick(event: any) {
    this.addFile(event.target.files[0]);
  }

  addFile(file: File) {
    this.onTouched();

    const regex = /\.([^.\\/:*?"<>|\r\n]+)$/;
    const match = file.name.match(regex);
    const fileExtension = match[1];
    if (!match || !this.allowedFileTypes.some(allowedFileExtension => fileExtension === allowedFileExtension)) {
      this._notification.openSnackBar(`The extension ${fileExtension} is not supported`);
      return;
    }

    this.fileToUpload = file;
    this._uploadFile(file);
  }

  removeFile() {
    this.ngControl.control.setValue(null);
    this.ngControl.control.markAsUntouched();
  }

  private _uploadFile(file: File): void {
    const formData = new FormData();
    formData.append(file.name, file);

    this._upload.upload(formData).subscribe((res: UploadedFileResponse) => {
      switch (this.representation) {
        case Constants.HasStillImageFileValue:
          this.previewUrl = this._sanitizer.bypassSecurityTrustUrl(
            `${res.uploadedFiles[0].temporaryUrl}/full/256,/0/default.jpg`
          );
          break;
        case Constants.HasDocumentFileValue:
          this.previewUrl = res.uploadedFiles[0].temporaryUrl;
          break;
      }

      const fileResponse = new (fileValueMapping.get(this.representation).uploadClass)();
      fileResponse.filename = res.uploadedFiles[0].internalFilename;
      this.onChange(fileResponse);
      this._cdr.detectChanges();
    });

    this.fileInput.nativeElement.value = null;
  }
}
