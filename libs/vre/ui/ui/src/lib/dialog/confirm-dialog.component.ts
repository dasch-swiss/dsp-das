import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogProps {
  message: string;
  title: string | null;
  subtitle: string | null;
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <app-dialog-header [title]="data.title ?? ('ui.dialog.confirmTitle' | translate)" [subtitle]="data.subtitle ?? ''" />
    <div mat-dialog-content>
      <p>{{ data.message }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">{{ 'ui.dialog.no' | translate }}</button>
      <button mat-raised-button color="warn" (click)="dialogRef.close(true)" data-cy="confirmation-button">{{ 'ui.dialog.yes' | translate }}</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogProps
  ) {}
}
