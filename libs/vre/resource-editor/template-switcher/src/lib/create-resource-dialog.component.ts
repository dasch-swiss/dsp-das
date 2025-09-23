import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';

export interface CreateResourceDialogProps {
  resourceType: string;
  resourceClassIri: string;
}

@Component({
  selector: 'app-create-resource-dialog',
  template: `
    <app-dialog-header [title]="'Create new resource of type: ' + data.resourceType" />
    <div mat-dialog-content style="max-height: 100%">
      @if (project$ | async; as project) {
        <app-create-resource-form
          [resourceClassIri]="data.resourceClassIri"
          [projectIri]="project.id"
          [projectShortcode]="project.shortcode"
          (createdResourceIri)="onCreatedResource($event)" />
      }
    </div>
  `,
})
export class CreateResourceDialogComponent {
  project$ = this._projectPageService.currentProject$;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CreateResourceDialogProps,
    private _dialogRef: MatDialogRef<CreateResourceDialogComponent>,
    private _projectPageService: ProjectPageService
  ) {}

  onCreatedResource(resourceIri: string) {
    this._dialogRef.close(resourceIri);
  }
}
