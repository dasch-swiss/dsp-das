import { DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { SegmentApiService } from './segment-api.service';
import { SegmentsService } from './segments.service';

export interface CreateSegmentDialogProps {
  resource: ReadResource;
  videoDurationSecs: number;
}

@Component({
  selector: 'app-create-segment-dialog',
  template: ` <app-dialog-header title="Create a segment"></app-dialog-header>
    <div mat-dialog-content>
      <app-common-input [control]="form.controls.label" label="Label*" />
      <app-time-input label="Start" [control]="form.controls.start" data-cy="start-input" />
      <app-time-input label="End" [control]="form.controls.end" data-cy="end-input" />
      <app-common-input label="Title" [control]="form.controls.title" data-cy="title-input" />
      <app-common-input label="Description" [control]="form.controls.description" data-cy="description-input" />
      <app-chip-list-input
        [formArray]="form.controls.keywords"
        data-cy="keywords-input"
        [validators]="keywordsValidators" />
      <app-common-input label="Comment" [control]="form.controls.comment" data-cy="comment-input" />
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

  readonly keywordsValidators = [Validators.minLength(3), Validators.maxLength(64)];

  form = this._fb.group({
    label: ['', Validators.required],
    start: [0, [Validators.required, Validators.min(0)]],
    end: [0, [Validators.required, Validators.max(this.data.videoDurationSecs)]],
    title: null as string | null,
    description: null as string | null,
    comment: null as string | null,
    keywords: this._fb.array([], this.keywordsValidators),
  });

  constructor(
    private _fb: FormBuilder,
    private _segmentApi: SegmentApiService,
    private _segmentsService: SegmentsService,
    private _dialogRef: DialogRef,
    @Inject(MAT_DIALOG_DATA) public data: CreateSegmentDialogProps
  ) {}

  onSubmit() {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();
    this._segmentApi
      .createVideoSegment(
        this.data.resource.id,
        this.data.resource.attachedToProject,
        formValue.label as string,
        formValue.start as number,
        formValue.end as number,
        formValue.comment ?? undefined,
        formValue.title ?? undefined,
        formValue.description ?? undefined,
        formValue.keywords.length > 0 ? formValue.keywords.join(' ') : undefined
      )
      .subscribe(() => {
        this._segmentsService.getVideoSegment(this.data.resource.id);
        this._dialogRef.close();
      });
  }
}
