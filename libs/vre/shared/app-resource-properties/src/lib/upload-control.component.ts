import { ChangeDetectorRef, Component, Input, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import {
  Constants,
  CreateArchiveFileValue,
  CreateAudioFileValue,
  CreateDocumentFileValue,
  CreateFileValue,
  CreateMovingImageFileValue,
  CreateStillImageFileValue,
  CreateTextFileValue,
  UpdateAudioFileValue,
} from '@dasch-swiss/dsp-js';
import { UploadedFile } from '@dasch-swiss/vre/shared/app-representations';
import { Actions, Store } from '@ngxs/store';
import { FileRepresentationType } from './file-representation.type';

@Component({
  selector: 'app-upload-control',
  template: `
    <app-upload
      [representation]="representation"
      (afterFileRemoved)="removeFile()"
      (afterFileUploaded)="doWithFile($event)"
      *ngIf="!loading; else loadingTpl" />
    <mat-error *ngIf="ngControl.touched && ngControl.errors">{{ ngControl.errors | humanReadableError }}</mat-error>

    <ng-template #loadingTpl>
      <dasch-swiss-app-progress-indicator />
    </ng-template>
  `,
})
export class UploadControlComponent implements ControlValueAccessor {
  @Input() resourceId?: string;
  @Input({ required: true }) representation!: FileRepresentationType;

  onChange!: (value: any) => void;
  onTouched!: () => void;

  loading = false;
  file: File | null = null;

  constructor(
    private _store: Store,
    private _actions$: Actions,
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

  doWithFile(res: UploadedFile) {
    if (this.resourceId) {
      const uploadedFile = new UpdateAudioFileValue();
      uploadedFile.id = this.resourceId;
      uploadedFile.filename = res.internalFilename;
      this.onChange(uploadedFile);
    } else {
      const createFile = this._createFileValue;
      createFile.filename = res.internalFilename;
      this.onChange(createFile);
    }
    this.onTouched();

    this._cdr.detectChanges();
  }

  removeFile() {
    this.ngControl.control!.setValue(null);
    this.ngControl.control!.markAsUntouched();
  }

  private get _createFileValue(): CreateFileValue {
    switch (this.representation) {
      case Constants.HasStillImageFileValue:
        return new CreateStillImageFileValue();
      case Constants.HasMovingImageFileValue:
        return new CreateMovingImageFileValue();
      case Constants.HasAudioFileValue:
        return new CreateAudioFileValue();
      case Constants.HasDocumentFileValue:
        return new CreateDocumentFileValue();
      case Constants.HasTextFileValue:
        return new CreateTextFileValue();
      case Constants.HasArchiveFileValue:
        return new CreateArchiveFileValue();
      default:
        throw new Error(`File type ${this.representation} not supported`);
    }
  }
}
