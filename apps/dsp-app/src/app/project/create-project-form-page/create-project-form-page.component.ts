import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-project-form-page',
  template: `
    <dasch-swiss-centered-layout>
      <app-reusable-project-form
        [formData]="{ shortcode: '', shortname: '', longname: '', description: [], keywords: [] }"
        (formValueChange)="onFormChange($event)"></app-reusable-project-form>

      <div style="display: flex; justify-content: space-between">
        <button color="primary" mat-button type="reset" [routerLink]="['..']">
          {{ 'appLabels.form.action.cancel' | translate }}
        </button>
        <button
          mat-raised-button
          type="submit"
          color="primary"
          [disabled]="!form || !form.valid"
          (click)="submitForm()"
          appLoadingButton
          [isLoading]="loading">
          {{ 'appLabels.form.action.submit' | translate }}
        </button>
      </div>
    </dasch-swiss-centered-layout>
  `,
})
export class CreateProjectFormPageComponent {
  form: FormGroup;
  loading = false;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  onFormChange(form: FormGroup) {
    this.form = form;
  }

  submitForm() {
    this.loading = true;
    this._dspApiConnection.admin.projectsEndpoint
      .createProject({
        keywords: this.form.get('keywords').value,
        logo: this.form.get('logo').value,
        longname: this.form.get('longname').value,
        description: this.form.get('description').value,
        selfjoin: this.form.get('selfjoin').value,
        shortcode: this.form.get('shortcode').value,
        shortname: this.form.get('shortname').value,
        status: this.form.get('status').value,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }
}
