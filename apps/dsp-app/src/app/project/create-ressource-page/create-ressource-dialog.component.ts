import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreateRessourcePageComponent } from '@dsp-app/src/app/project/create-ressource-page/create-ressource-page.component';

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
    private _dialogRef: MatDialogRef<CreateRessourcePageComponent>
  ) {}

  onCreatedResource(resourceIri: string) {
    this._dialogRef.close(resourceIri);
  }
}
