import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KnoraApiConnection, ReadResource, UpdateResource, UpdateValue } from '@dasch-swiss/dsp-js';
import { LicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { finalize } from 'rxjs/operators';
import { FileRepresentationType } from '../file-representation.type';
import { ResourceFetcherService } from '../resource-fetcher.service';

export interface ReplaceFileDialogProps {
  representation: FileRepresentationType;
  resource: ReadResource;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-replace-file-dialog',
  template: `
    <app-dialog-header [title]="data.title" [subtitle]="data.subtitle" />
    <mat-dialog-content>
      <div class="warning">
        <div class="container">
          <div class="icon">
            <mat-icon>warning</mat-icon>
          </div>
          <div class="message">{{ data.title }} will be replaced.</div>
        </div>
      </div>

      <app-upload-control [representation]="data.representation" [formControl]="form" [resourceId]="propId" />
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" data-cy="replace-file-cancel-button" (click)="dialogRef.close()">
        {{ 'form.action.cancel' | translate }}
      </button>
      <button
        mat-raised-button
        type="submit"
        data-cy="replace-file-submit-button"
        [color]="'primary'"
        (click)="replaceFile()">
        {{ 'form.action.submit' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./replace-file-dialog.component.scss'],
})
export class ReplaceFileDialogComponent implements OnInit {
  propId!: string;

  form = this._fb.group({
    file: this._fb.control<string | null>(null, [Validators.required]),
    legal: {
      copyrightHolder: this._fb.control<string | null>(null, [Validators.required]),
      license: this._fb.control<LicenseDto | null>(null, [Validators.required]),
      authorship: this._fb.control<string[] | null>(null, [Validators.required]),
    },
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ReplaceFileDialogProps,
    public dialogRef: MatDialogRef<ReplaceFileDialogComponent>,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _resourceFetcher: ResourceFetcherService,
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    this.propId = this.data.resource.properties[this.data.representation][0].id;
  }

  replaceFile() {
    const updateRes = new UpdateResource<UpdateValue>();
    updateRes.id = this.data.resource.id;
    updateRes.type = this.data.resource.type;
    updateRes.property = this.data.representation;
    const formValue = this.form.getRawValue();
    const value = {
      filename: formValue.file!,
      copyrightHolder: 'julien',
    };
    updateRes.value = value as unknown as UpdateValue;

    this._dspApiConnection.v2.values
      .updateValue(updateRes)
      .pipe(
        finalize(() => {
          this._resourceFetcher.reload();
          this.dialogRef.close();
        })
      )
      .subscribe();
  }
}
