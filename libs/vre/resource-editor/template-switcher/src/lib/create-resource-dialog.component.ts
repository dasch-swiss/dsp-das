import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogTitle,
  MatDialogActions,
} from '@angular/material/dialog';
import { ResourceCreationServiceInterface } from '@dasch-swiss/vre/core/session';

export interface CreateResourceDialogProps {
  resourceType: string;
  resourceClassIri: string;
  projectIri?: string;
  projectShortcode?: string;
}

@Component({
  selector: 'app-create-resource-dialog',
  template: `
    <div mat-dialog-title>Create new resource of type: {{ data.resourceType }}</div>
    <div mat-dialog-content>
      @if (data.projectIri && data.projectShortcode) {
        <p>This feature will create a new resource of type "{{ data.resourceType }}".</p>
        <p>
          <small>Project: {{ data.projectShortcode }}</small>
        </p>
      } @else {
        <p>Project information is required to create a resource.</p>
      }
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      @if (data.projectIri && data.projectShortcode) {
        <button mat-raised-button color="primary" (click)="createResource()" [disabled]="creating">
          {{ creating ? 'Creating...' : 'Create Resource' }}
        </button>
      }
    </div>
  `,
  standalone: true,
  imports: [CdkScrollable, MatDialogContent, MatDialogTitle, MatDialogActions, MatButton],
})
export class CreateResourceDialogComponent {
  creating = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CreateResourceDialogProps,
    private _dialogRef: MatDialogRef<CreateResourceDialogComponent>,
    private _resourceCreationService: ResourceCreationServiceInterface
  ) {}

  cancel() {
    this._dialogRef.close();
  }

  createResource() {
    if (!this.data.projectIri || !this.data.projectShortcode) {
      return;
    }

    this.creating = true;
    this._resourceCreationService
      .createResource({
        resourceClassIri: this.data.resourceClassIri,
        projectIri: this.data.projectIri,
        projectShortcode: this.data.projectShortcode,
      })
      .subscribe({
        next: resourceIri => {
          this.creating = false;
          this.onCreatedResource(resourceIri || '');
        },
        error: () => {
          this.creating = false;
        },
      });
  }

  onCreatedResource(resourceIri: string) {
    this._dialogRef.close(resourceIri);
  }
}
