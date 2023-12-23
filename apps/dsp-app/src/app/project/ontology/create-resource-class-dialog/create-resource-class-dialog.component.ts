import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreateResourceClass, KnoraApiConnection, UpdateOntology } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-resource-class-dialog',
  template: `
    <app-dialog-header [title]="data.title" subtitle="Customize resource class"></app-dialog-header>
    <div mat-dialog-content>
      <app-resource-class-form
        [formData]="{ name: '', label: [], description: [] }"
        (formValueChange)="form = $event"></app-resource-class-form>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="form.invalid"
        (click)="onSubmit()">
        Create
      </button>
    </div>
  `,
})
export class CreateResourceClassDialogComponent {
  loading = false;
  form: FormGroup;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: string; title: string; ontologyId: string; lastModificationDate: string }
  ) {}

  onSubmit() {
    const onto = new UpdateOntology<CreateResourceClass>();

    onto.id = this.data.ontologyId;
    onto.lastModificationDate = 'this.lastModificationDate';

    const newResClass = new CreateResourceClass();

    newResClass.name = this.form.value.name;
    newResClass.label = this.form.value.label;
    newResClass.comment = this.form.value.description;
    newResClass.subClassOf = [this.data.id];

    onto.entity = newResClass;

    this._dspApiConnection.v2.onto
      .createResourceClass(onto)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }
}
