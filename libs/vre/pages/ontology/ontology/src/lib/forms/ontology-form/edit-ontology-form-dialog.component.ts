import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { OntologyMetadata } from '@dasch-swiss/dsp-js';
import { DialogHeaderComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { LoadingButtonDirective } from '@dasch-swiss/vre/ui/progress-indicator';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { OntologyEditService } from '../../services/ontology-edit.service';
import { OntologyFormComponent } from './ontology-form.component';
import { OntologyForm, UpdateOntologyData } from './ontology-form.type';

@Component({
  selector: 'app-edit-ontology-form-dialog',
  template: ` <app-dialog-header [title]="data.id" [subtitle]="'pages.ontology.ontologyForm.edit' | translate" />

    <app-ontology-form [data]="data" [mode]="'edit'" (afterFormInit)="afterFormInit($event)" />

    <div mat-dialog-actions align="end">
      <button color="primary" mat-button mat-dialog-close>{{ 'ui.form.action.cancel' | translate }}</button>
      <button
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        data-cy="submit-button"
        (click)="onSubmit()">
        {{ 'ui.form.action.submit' | translate }}
      </button>
    </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DialogHeaderComponent,
    OntologyFormComponent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    LoadingButtonDirective,
    TranslateModule,
  ],
})
export class EditOntologyFormDialogComponent {
  loading = false;

  form!: OntologyForm;

  constructor(
    private _oes: OntologyEditService,
    @Inject(MAT_DIALOG_DATA) public data: UpdateOntologyData,
    public dialogRef: MatDialogRef<EditOntologyFormDialogComponent, OntologyMetadata>
  ) {}

  afterFormInit(form: OntologyForm) {
    this.form = form;
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    this._oes
      .updateOntology$({
        id: this.data.id,
        label: this.form.controls.label.value,
        comment: this.form.controls.comment.value,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(ontology => {
        this.dialogRef.close(ontology);
      });
  }
}
