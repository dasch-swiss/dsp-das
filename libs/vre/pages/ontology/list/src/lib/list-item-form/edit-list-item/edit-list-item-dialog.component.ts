import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { StringLiteral } from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DialogHeaderComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { LoadingButtonDirective } from '@dasch-swiss/vre/ui/progress-indicator';
import { MultiLanguages } from '@dasch-swiss/vre/ui/string-literal';
import { finalize, of, switchMap } from 'rxjs';
import { ListItemForm } from '../list-item-form.type';
import { ReusableListItemFormComponent } from '../reusable-list-item-form.component';

export interface EditListItemDialogProps {
  nodeIri: string;
  projectIri: string;
  formData: { labels: MultiLanguages; comments: MultiLanguages };
}

@Component({
  selector: 'app-edit-list-item-dialog',
  template: `
    <app-dialog-header [title]="data.formData.labels[0].value" subtitle="Edit child node" />

    <div mat-dialog-content>
      <app-reusable-list-item-form [formData]="data.formData" (afterFormInit)="form = $event" />
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>

      <button
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="form.invalid"
        (click)="updateChildNode()">
        Submit
      </button>
    </div>
  `,
  standalone: true,
  imports: [
    DialogHeaderComponent,
    CdkScrollable,
    MatDialogContent,
    ReusableListItemFormComponent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    LoadingButtonDirective,
  ],
})
export class EditListItemDialogComponent {
  form: ListItemForm;
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: EditListItemDialogProps,
    public dialogRef: MatDialogRef<EditListItemDialogComponent, boolean>,
    private _listApiService: ListApiService
  ) {}

  updateChildNode() {
    this.loading = true;

    const payload = {
      projectIri: this.data.projectIri,
      listIri: this.data.nodeIri,
      labels: this.form.getRawValue().labels as StringLiteral[],
      comments: this.form.getRawValue().comments.length > 0 ? (this.form.value.comments as StringLiteral[]) : null, // TODO: improve form to avoir this ?
    };

    this._listApiService
      .updateChildNode(payload.listIri, payload)
      .pipe(
        switchMap(() => {
          // if initial comments Length is not equal to 0 and the comment is now empty, send request to delete comment
          if (this.data.formData.comments.length > 0 && this.form.value.comments.length === 0) {
            return this._listApiService.deleteChildComments(payload.listIri);
          }
          return of(true);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }
}
