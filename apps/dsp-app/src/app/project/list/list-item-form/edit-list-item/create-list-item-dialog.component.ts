import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-create-list-item-dialog',
  template: `
    <app-dialog-header title="Insert new child node"></app-dialog-header>
    <div mat-dialog-content>
      <app-edit-list-item
        mode="insert"
        [iri]="data.id"
        [projectIri]="data.project"
        [parentIri]="data.parentIri"
        [position]="data.position"
        (closeDialog)="dialogRef.close($event)">
      </app-edit-list-item>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>No</button>
      <button mat-button>Yes</button>
    </div>
  `,
})
export class CreateListItemDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string; project: string; parentIri: string; position: number },
    public dialogRef: MatDialogRef<CreateListItemDialogComponent>
  ) {}
}
