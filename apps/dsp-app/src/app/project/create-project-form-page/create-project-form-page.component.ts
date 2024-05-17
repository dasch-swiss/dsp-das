import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectApiService } from '@dasch-swiss/vre/shared/app-api';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { AddUserToProjectMembershipAction, LoadProjectsAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { finalize, map } from 'rxjs/operators';
import { ProjectForm } from '../reusable-project-form/project-form.type';

@Component({
  selector: 'app-create-project-form-page',
  template: `
    <dasch-swiss-centered-layout>
      <app-reusable-project-form
        [formData]="{
          shortcode: '',
          shortname: '',
          longname: '',
          description: [],
          keywords: []
        }"
        (afterFormInit)="form = $event"></app-reusable-project-form>

      <div style="display: flex; justify-content: space-between">
        <button color="primary" mat-button type="reset" (click)="goBack()">
          {{ 'appLabels.form.action.cancel' | translate }}
        </button>

        <button
          mat-raised-button
          type="submit"
          color="primary"
          [disabled]="!form || !form.valid"
          (click)="submitForm()"
          appLoadingButton
          data-cy="submit-button"
          [isLoading]="loading">
          {{ 'appLabels.form.action.submit' | translate }}
        </button>
      </div>
    </dasch-swiss-centered-layout>
  `,
})
export class CreateProjectFormPageComponent {
  form: ProjectForm;
  loading = false;

  constructor(
    private _projectApiService: ProjectApiService,
    private _store: Store,
    private _router: Router,
    private _location: Location
  ) {}

  submitForm() {
    this.loading = true;
    this._projectApiService
      .create({
        shortcode: this.form.getRawValue().shortcode,
        shortname: this.form.getRawValue().shortname,
        longname: this.form.getRawValue().longname,
        description: this.form.getRawValue().description,
        keywords: this.form.getRawValue().keywords,
        selfjoin: true,
        status: true,
      })
      .pipe(
        map(projectResponse => {
          if (this._router.url.includes(RouteConstants.assignCurrentUser)) {
            const currentUser = this._store.selectSnapshot(UserSelectors.user);
            this._store.dispatch(new AddUserToProjectMembershipAction(currentUser.id, projectResponse.project.id));
          }

          return projectResponse;
        })
      )
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(projectResponse => {
        const uuid = ProjectService.IriToUuid(projectResponse.project.id);
        this._store.dispatch(new LoadProjectsAction());
        this._router.navigate([RouteConstants.projectRelative, uuid]);
      });
  }

  goBack() {
    this._location.back();
  }
}
