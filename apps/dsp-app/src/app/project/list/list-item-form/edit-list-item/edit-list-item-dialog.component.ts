import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ListApiService } from '@dasch-swiss/vre/shared/app-api';
import { MultiLanguages } from '@dasch-swiss/vre/shared/app-string-literal';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface EditListItemDialogProps {
  parentIri: string;
  projectUuid: string;
  projectIri: string;
  listIri: string;
  formData: { labels: MultiLanguages; descriptions: MultiLanguages };
}
@Component({
  selector: 'app-edit-list-item-dialog',
  template: `
    <app-dialog-header title="Edit child node"></app-dialog-header>

    <div mat-dialog-content>
      <app-full-list-item-form
        [formData]="data.formData"
        [parentIri]="data.parentIri"
        [projectUuid]="data.projectUuid"
        (formValueChange)="form = $event"></app-full-list-item-form>
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
})
export class EditListItemDialogComponent {
  form: FormGroup;
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: EditListItemDialogProps,
    public dialogRef: MatDialogRef<EditListItemDialogComponent, boolean>,
    private _listApiService: ListApiService
  ) {}

  updateChildNode() {
    this.loading = true;

    const data = {
      projectIri: this.data.projectIri,
      listIri: this.data.listIri,
      labels: this.form.value.labels,
      comments: this.form.value.descriptions,
    };

    this._listApiService
      .updateChildNode(data.listIri, data)
      .pipe(
        switchMap(() => {
          // if initial comments Length is not equal to 0 and the comment is now empty, send request to delete comment
          if (this.data.formData.descriptions.length !== 0 && this.form.value.descriptions.length === 0) {
            return this._listApiService.deleteChildComments(data.listIri);
          }
          return of(true);
        })
      )
      .subscribe(() => {
        this.loading = false;
        this.dialogRef.close(true);
      });
  }
}
