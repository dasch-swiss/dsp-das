import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  DeleteResourceClassComment,
  KnoraApiConnection,
  StringLiteral,
  UpdateOntology,
  UpdateResourceClassComment,
  UpdateResourceClassLabel,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { MultiLanguages } from '@dasch-swiss/vre/ui/string-literal';
import { switchMap, tap } from 'rxjs/operators';
import { ResourceClassForm } from '../resource-class-form/resource-class-form.type';

export interface EditResourceClassDialogProps {
  id: string;
  title: string;
  ontologyId: string;
  lastModificationDate: string;
  name: string;
  labels: MultiLanguages;
  comments: MultiLanguages;
}

@Component({
  selector: 'app-edit-resource-class-dialog',
  template: `
    <app-dialog-header [title]="data.title" subtitle="Customize resource class" />
    <div mat-dialog-content>
      <app-resource-class-form
        [formData]="{ name: data.name, labels: data.labels, comments: data.comments }"
        (afterFormInit)="afterFormInit($event)" />
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        data-cy="submit-button"
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="form.invalid"
        (click)="onSubmit()">
        Update
      </button>
    </div>
  `,
})
export class EditResourceClassDialogComponent implements OnInit {
  loading = false;
  form: ResourceClassForm | undefined;
  lastModificationDate!: string;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    @Inject(MAT_DIALOG_DATA)
    public data: EditResourceClassDialogProps,
    public dialogRef: MatDialogRef<EditResourceClassDialogComponent, boolean>
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', ''); // Set your desired width
    this.lastModificationDate = this.data.lastModificationDate;
  }

  afterFormInit(form: ResourceClassForm) {
    this.form = form;
    this.form.controls.name.disable();
  }

  onSubmit() {
    this.loading = true;

    // label
    const onto4Label = new UpdateOntology<UpdateResourceClassLabel>();
    onto4Label.id = this.data.ontologyId;
    onto4Label.lastModificationDate = this.lastModificationDate;

    const updateLabel = new UpdateResourceClassLabel();
    updateLabel.id = this.data.id;
    updateLabel.labels = this.form.value.labels as StringLiteral[];
    onto4Label.entity = updateLabel;

    // comment
    const onto4Comment = new UpdateOntology<UpdateResourceClassComment>();
    onto4Comment.id = this.data.ontologyId;

    const updateComment = new UpdateResourceClassComment();
    updateComment.id = this.data.id;
    updateComment.comments = this.form.value.comments as StringLiteral[];
    onto4Comment.entity = updateComment;

    this._dspApiConnection.v2.onto
      .updateResourceClass(onto4Label)
      .pipe(
        switchMap(classLabelResponse => {
          this.lastModificationDate = classLabelResponse.lastModificationDate;
          onto4Comment.lastModificationDate = this.lastModificationDate;

          if (updateComment.comments.length) {
            return this._updateComment$(onto4Comment);
          } else {
            return this._deleteResourceComment$();
          }
        }),
        tap(() => {
          this.loading = false;
        })
      )
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  private _deleteResourceComment$() {
    const deleteResourceClassComment = new DeleteResourceClassComment();
    deleteResourceClassComment.id = this.data.id;
    deleteResourceClassComment.lastModificationDate = this.lastModificationDate;

    return this._dspApiConnection.v2.onto.deleteResourceClassComment(deleteResourceClassComment).pipe(
      tap(deleteCommentResponse => {
        this.lastModificationDate = deleteCommentResponse.lastModificationDate;
      })
    );
  }

  private _updateComment$(onto4Comment) {
    return this._dspApiConnection.v2.onto.updateResourceClass(onto4Comment).pipe(
      tap(classCommentResponse => {
        this.lastModificationDate = classCommentResponse.lastModificationDate;
      })
    );
  }
}
