import { DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { Segment } from './segment';
import { SegmentApiService } from './segment-api.service';

export interface DeleteSegmentDialogProps {
  resourceId: string;
  segment: Segment;
  lastModificationDate: string;
}

export interface SegmentToDelete {
  resourceId: string;
  lastModificationDate?: string;
  deleteComment?: string;
}

@Component({
  selector: 'app-delete-segment-dialog',
  template: ` <app-dialog-header title="Do you want to delete selected segemnt?"></app-dialog-header>
    <mat-dialog-content class="form-content">
      <mat-form-field class="large-field">
        <mat-label>Comment why segment is being deleted</mat-label>
        <textarea
          matInput
          class="deletion-comment"
          type="text"
          [(ngModel)]="comment"
          [placeholder]="'Ex. Segment was created by mistake...'"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button color="primary" mat-dialog-close class="cancel-button center">No, keep it</button>
      <span class="fill-remaining-space"></span>
      <button mat-button mat-raised-button [color]="'warn'" class="confirm-button center" (click)="submit()">
        Yes, delete
      </button>
    </mat-dialog-actions>`,
})
export class DeleteSegmentDialogComponent {
  comment: string | undefined;

  constructor(
    @Inject(DspApiConnectionToken)
    private _segmentApiService: SegmentApiService,
    @Inject(MAT_DIALOG_DATA)
    public data: DeleteSegmentDialogProps,
    private _dialogRef: MatDialogRef<DeleteSegmentDialogComponent>
  ) {}

  submit() {
    const payload = {} as SegmentToDelete;
    payload.resourceId = this.data.resourceId;
    payload.deleteComment = this.comment ?? undefined;
    payload.lastModificationDate = this.data.lastModificationDate;
    // this._segmentApiService.DeleteSegment(payload.resourceId)
  }
}
