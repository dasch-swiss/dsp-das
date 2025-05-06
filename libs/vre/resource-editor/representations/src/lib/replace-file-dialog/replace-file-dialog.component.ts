import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KnoraApiConnection, ReadResource, UpdateFileValue, UpdateResource } from '@dasch-swiss/dsp-js';
import { LicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { finalize } from 'rxjs/operators';
import { FileForm } from '../../../../resource-properties/src/lib/file-form.type';
import { FileRepresentationType } from '../file-representation.type';
import { fileValueMapping } from '../file-value-mapping';
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

      <app-create-resource-form-file
        *ngIf="resourceFetcher.projectShortcode$ | async as projectShortcode"
        [form]="form"
        [fileRepresentation]="data.representation"
        [projectShortcode]="projectShortcode" />
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" data-cy="replace-file-cancel-button" (click)="dialogRef.close()">
        {{ 'ui.form.action.cancel' | translate }}
      </button>
      <button
        mat-raised-button
        type="submit"
        data-cy="replace-file-submit-button"
        [color]="'primary'"
        (click)="replaceFile()">
        {{ 'ui.form.action.submit' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./replace-file-dialog.component.scss'],
})
export class ReplaceFileDialogComponent implements OnInit {
  propId!: string;

  form = this._fb.group({
    link: [null as string | null, [Validators.required]],
    legal: this._fb.group({
      copyrightHolder: null as string | null,
      license: null as LicenseDto | null,
      authorship: null as string[] | null,
    }),
  }) as unknown as FileForm;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ReplaceFileDialogProps,
    public dialogRef: MatDialogRef<ReplaceFileDialogComponent>,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    public resourceFetcher: ResourceFetcherService,
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    this.propId = this.data.resource.properties[this.data.representation][0].id;
  }

  replaceFile() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();

    const uploadedFile = fileValueMapping.get(this.data.representation)!.update();
    uploadedFile.id = this.data.resource.properties[this.data.representation][0].id;
    uploadedFile.filename = formValue.link!;
    uploadedFile.copyrightHolder = formValue.legal.copyrightHolder!;
    uploadedFile.license = formValue.legal.license!;
    uploadedFile.authorship = formValue.legal.authorship!;

    const updateRes = new UpdateResource<UpdateFileValue>();
    updateRes.id = this.data.resource.id;
    updateRes.type = this.data.resource.type;
    updateRes.property = this.data.representation;

    updateRes.value = uploadedFile;

    this._dspApiConnection.v2.values
      .updateValue(updateRes)
      .pipe(
        finalize(() => {
          this.resourceFetcher.reload();
          this.dialogRef.close();
        })
      )
      .subscribe();
  }
}
