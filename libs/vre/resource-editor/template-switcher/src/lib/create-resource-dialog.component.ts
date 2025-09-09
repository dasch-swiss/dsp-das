import { CdkScrollable } from '@angular/cdk/scrolling';
import { AsyncPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { CreateResourceFormComponent } from '@dasch-swiss/vre/resource-editor/resource-creator';
import { DialogHeaderComponent } from '@dasch-swiss/vre/shared/app-common-to-move';

export interface CreateResourceDialogProps {
  resourceType: string;
  resourceClassIri: string;
}

@Component({
  selector: 'app-create-resource-dialog',
  template: `
    <app-dialog-header [title]="'Create new resource of type: ' + data.resourceType" />
    <div mat-dialog-content>
      @if (project$ | async; as project) {
        <app-create-resource-form
          [resourceClassIri]="data.resourceClassIri"
          [projectIri]="project.id"
          [projectShortcode]="project.shortcode"
          (createdResourceIri)="onCreatedResource($event)" />
      }
    </div>
  `,
  standalone: true,
  imports: [DialogHeaderComponent, CdkScrollable, MatDialogContent, CreateResourceFormComponent, AsyncPipe],
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
