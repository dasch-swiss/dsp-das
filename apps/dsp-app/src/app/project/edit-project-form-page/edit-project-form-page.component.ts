import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateProjectRequest } from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/shared/app-api';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { LoadProjectsAction, UpdateProjectAction } from '@dasch-swiss/vre/shared/app-state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { map, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-edit-project-form-page',
  template: ` <dasch-swiss-centered-layout>
    <app-reusable-project-form
      *ngIf="project$ | async as project"
      [formData]="{
        shortcode: project.shortcode,
        shortname: project.shortname,
        longname: project.longname,
        description: project.description,
        keywords: project.keywords
      }"
      (afterFormInit)="form = $event"></app-reusable-project-form>

    <div style="display: flex; justify-content: space-between">
      <button
        mat-raised-button
        type="submit"
        color="primary"
        [disabled]="form?.invalid"
        (click)="onSubmit()"
        appLoadingButton
        [isLoading]="loading"
        data-cy="submit-button">
        {{ 'appLabels.form.action.submit' | translate }}
      </button>
    </div>
  </dasch-swiss-centered-layout>`,
})
export class EditProjectFormPageComponent {
  form: FormGroup;
  loading = false;
  project$ = this.route.parent.parent.paramMap.pipe(
    map(params => params.get(RouteConstants.uuidParameter)),
    map(uuid => this._projectService.uuidToIri(uuid)),
    switchMap(iri => this._projectApiService.get(iri)),
    map(project => project.project)
  );

  constructor(
    private _projectApiService: ProjectApiService,
    private _projectService: ProjectService,
    private route: ActivatedRoute,
    private _store: Store,
    private _router: Router,
    private _notification: NotificationService,
    private _actions: Actions
  ) {}

  onSubmit() {
    const projectUuid = this.route.parent.parent.snapshot.paramMap.get(RouteConstants.uuidParameter);

    const projectData: UpdateProjectRequest = {
      longname: this.form.value.longname,
      description: this.form.value.description,
      keywords: this.form.value.keywords,
    };

    this._store.dispatch(new UpdateProjectAction(projectUuid, projectData));
    this._actions.pipe(ofActionSuccessful(LoadProjectsAction), take(1)).subscribe(() => {
      this._notification.openSnackBar('You have successfully updated the project information.');
      this._router.navigate([`${RouteConstants.projectRelative}/${projectUuid}`]);
    });
  }
}
