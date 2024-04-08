import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface CreateResourceDialogProps {
  resourceType: string;
  resourceClassIri: string;
  projectIri: string;
}

@Component({
  selector: 'app-create-ressource-dialog',
  template: `
    <app-create-ressource-form
      [resourceType]="data.resourceType"
      [resourceClassIri]="data.resourceClassIri"
      [projectIri]="data.projectIri"
      (createdResourceIri)="onCreatedResource($event)"></app-create-ressource-form>
  `,
})
export class CreateRessourceDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CreateResourceDialogProps,
    private _dialogRef: MatDialogRef<CreateRessourceDialogComponent>
  ) {}

  onCreatedResource(resourceIri: string) {
    this._dialogRef.close(resourceIri);
  }
}
