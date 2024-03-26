import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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
      [projectIri]="data.projectIri"></app-create-ressource-form>
  `,
})
export class CreateRessourceDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: CreateResourceDialogProps) {}
}
