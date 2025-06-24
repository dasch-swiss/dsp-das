import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DefaultClass, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { MultiLanguages } from '@dasch-swiss/vre/ui/string-literal';
import { UpdateResourceClassData, ResourceClassForm, ResourceClassFormData } from './resource-class-form.type';

@Component({
  selector: 'app-edit-resource-class-dialog',
  template: `
    <app-dialog-header [title]="''" subtitle="Customize resource class" />
    <div mat-dialog-content>
      <app-resource-class-form [formData]="formData" (afterFormInit)="afterFormInit($event)" />
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        data-cy="submit-button"
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="form?.invalid"
        (click)="onSubmit()">
        Update
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditResourceClassDialogComponent implements OnInit {
  loading = false;
  form: ResourceClassForm | undefined;
  formData!: ResourceClassFormData;
  lastModificationDate!: string;

  isUpdateResourceClassData(data: UpdateResourceClassData | DefaultClass): data is UpdateResourceClassData {
    return 'id' in data;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: UpdateResourceClassData | DefaultClass,
    public dialogRef: MatDialogRef<EditResourceClassDialogComponent, ResourceClassFormData | UpdateResourceClassData>,
    private _ontologyService: OntologyService
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
    if (this.isUpdateResourceClassData(this.data)) {
      this.formData = {
        name: this._ontologyService.getNameFromIri(this.data.id),
        labels: this.data.labels ? (this.data.labels as MultiLanguages) : [],
        comments: this.data.comments ? (this.data.comments as MultiLanguages) : [],
      };
    } else {
      this.formData = {
        name: '',
        labels: [],
        comments: [],
      };
    }
  }

  afterFormInit(form: ResourceClassForm) {
    this.form = form;
    if (this.isUpdateResourceClassData(this.data)) {
      this.form.controls.name.disable();
    }
  }

  onSubmit() {
    const labels = this.form?.controls.labels.dirty
      ? (this.form?.controls.labels.value as StringLiteralV2[])
      : undefined; // by leaving the labels undefined, they are not updated unnecessarily by the ontology service
    const comments = this.form?.controls.comments.dirty
      ? (this.form?.controls.comments.value as StringLiteralV2[])
      : undefined; // by leaving the comments undefined, they are not updated unnecessarily by the ontology service

    const resourceClassData =
      'id' in this.data
        ? ({ id: this.data.id, labels, comments } as UpdateResourceClassData)
        : ({
            name: this.form?.controls.name.value,
            subclassOf: this.data.iri,
            labels,
            comments,
          } as unknown as ResourceClassFormData);

    this.dialogRef.close(resourceClassData);
  }
}
