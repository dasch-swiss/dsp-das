import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';

@Component({
    selector: 'app-create-project-form-page',
    template: `
        <div style='width: 600px'>
        <app-reusable-project-form [formData]="{ shortname: '', longname: '', shortcode: '', description: []}"
                                   (formValueChange)='onFormChange($event)'></app-reusable-project-form>

        <div style='display: flex; justify-content: space-between'>
            <button class="cancel-button"
                    color="primary"
                    mat-button
                    type="reset"
                    (click)="goBack()">
                {{ 'appLabels.form.action.cancel' | translate }}
            </button>
        <button
            mat-raised-button
            type='submit'
            (onClick)='submitForm()'
            [disabled]="!form || !form.valid"
            color='primary'
          >
            <dasch-swiss-app-progress-indicator
                [color]="'white'"
                [status]='0'
                *ngIf='loading'
            >
            </dasch-swiss-app-progress-indicator>
            <span>{{ 'appLabels.form.action.submit' | translate }}</span>
        </button>
        </div>
        </div>
        <app-project-form></app-project-form>
    `,
})
export class CreateProjectFormPageComponent {
    form: FormGroup;
    loading = false;

    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _location: Location,
    ) {
    }

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
            }).pipe(finalize(() => this.loading = false)).subscribe();
    }

    goBack() {
        this._location.back();
    }
}
