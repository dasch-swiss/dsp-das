import { CdkScrollable } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogTitle,
} from '@angular/material/dialog';

export interface ConfirmDialogProps {
  message: string;
  title: string | null;
  subtitle: string | null;
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div mat-dialog-title>{{ data.title ?? 'Confirmation needed' }}</div>
    @if (data.subtitle) {
      <div style="font-size: 14px; color: #666; margin-bottom: 16px;">{{ data.subtitle }}</div>
    }
    <div mat-dialog-content>
      <p>{{ data.message }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">No</button>
      <button mat-raised-button color="warn" (click)="dialogRef.close(true)" data-cy="confirmation-button">Yes</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CdkScrollable, MatDialogContent, MatDialogActions, MatDialogTitle, MatButton],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogProps
  ) {}
}
