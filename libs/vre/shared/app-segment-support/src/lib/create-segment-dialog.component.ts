import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SegmentApiService } from './segment-api.service';

@Component({
  selector: 'app-create-segment-dialog',
  template: ` <app-dialog-header title="Create a segment"></app-dialog-header>
    <div mat-dialog-content>
      <app-common-input [control]="form.controls.label" placeholder="Label*"></app-common-input>

      <app-common-input
        placeholder="Start*"
        [control]="form.controls.start"
        type="number"
        data-cy="start-input"></app-common-input>
      <app-common-input
        placeholder="End*"
        [control]="form.controls.end"
        type="number"
        data-cy="end-input"></app-common-input>

      <app-common-input placeholder="title" [control]="form.controls.title" data-cy="title-input"></app-common-input>

      <app-common-input
        placeholder="Description"
        [control]="form.controls.description"
        data-cy="description-input"></app-common-input>

      <app-common-input
        placeholder="Keyword"
        [control]="form.controls.keyword"
        data-cy="keyword-input"></app-common-input>

      <app-common-input
        placeholder="Comment"
        [control]="form.controls.comment"
        data-cy="comment-input"></app-common-input>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close data-cy="cancel-button">Cancel</button>
      <button
        data-cy="submit-button"
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="form.invalid"
        (click)="onSubmit()">
        Submit
      </button>
    </div>`,
})
export class CreateSegmentDialogComponent {
  loading = false;

  form = this._fb.group({
    label: ['', Validators.required],
    start: [0, Validators.required],
    end: [0, Validators.required],
    title: null as string | null,
    description: null as string | null,
    comment: null as string | null,
    keyword: null as string | null,
  });

  constructor(
    private _fb: FormBuilder,
    private _segmentApi: SegmentApiService,
    private _dialogRef: DialogRef
  ) {}

  onSubmit() {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();
    this._segmentApi
      .create(
        'http://rdfh.ch/0803/O5J50GVGTZ2W4ZyC5ZM5HQ',
        formValue.label as string,
        formValue.start as number,
        formValue.end as number,
        formValue.title ?? undefined,
        formValue.description ?? undefined,
        formValue.comment ?? undefined,
        formValue.keyword ?? undefined
      )
      .subscribe(() => {
        this._dialogRef.close();
      });
  }
}
