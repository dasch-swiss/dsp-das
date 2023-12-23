import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreateResourceClass, KnoraApiConnection, UpdateOntology } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-edit-resource-class-dialog',
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
        Update
      </button>
    </div>
  `,
})
export class EditResourceClassDialogComponent {
  loading = false;
  form: FormGroup;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: string; title: string; ontologyId: string; lastModificationDate: string }
  ) {}

  onSubmit() {
    this.loading = true;

    this._dspApiConnection.v2.onto
      .updateResourceClass(this._updateOntology())
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  private _updateOntology() {}
}
