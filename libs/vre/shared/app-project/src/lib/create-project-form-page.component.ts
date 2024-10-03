import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectApiService } from '@dasch-swiss/vre/shared/app-api';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { AddUserToProjectMembershipAction, LoadProjectsAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { finalize } from 'rxjs/operators';
import { ProjectForm } from './reusable-project-form/project-form.type';

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
          keywords: [],
        }"
        (afterFormInit)="form = $event"></app-reusable-project-form>

      <div style="display: flex; justify-content: space-between">
        <button color="primary" mat-button type="reset" (click)="goBack()">
          {{ 'form.action.cancel' | translate }}
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
          {{ 'form.action.submit' | translate }}
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
    private _location: Location,
    private _route: ActivatedRoute
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
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(projectResponse => {
        if (this._route.snapshot.queryParams[RouteConstants.assignCurrentUser]) {
          const currentUser = this._store.selectSnapshot(UserSelectors.user);
          this._store.dispatch(new AddUserToProjectMembershipAction(currentUser.id, projectResponse.project.id));
        }

        const uuid = ProjectService.IriToUuid(projectResponse.project.id);
        this._store.dispatch(new LoadProjectsAction());
        this._router.navigate([RouteConstants.projectRelative, uuid]);
      });
  }

  goBack() {
    this._location.back();
  }
}
