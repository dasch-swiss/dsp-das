import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileRepresentationType } from './replace-file-form/file-representation-type';

export interface ReplaceFileDialogProps {
  title: string;
  subtitle: string;
  representation: FileRepresentationType;
  id: string;
}

@Component({
  selector: 'app-replace-file-dialog',
  template: ` <app-dialog-header [title]="data.title" [subtitle]="data.subtitle" />
    <mat-dialog-content>
      <app-replace-file-form
        [representation]="data.representation"
        [propId]="data.id"
        (closeDialog)="dialogRef.close($event)" />
    </mat-dialog-content>`,
})
export class ReplaceFileDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ReplaceFileDialogProps,
    public dialogRef: MatDialogRef<ReplaceFileDialogComponent>
  ) {}
}
