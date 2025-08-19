import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { MultiLanguages } from '@dasch-swiss/vre/ui/string-literal';
import { TranslateService } from '@ngx-translate/core';
import { map, switchMap } from 'rxjs';
import { ProjectForm } from './project-form.type';

@Component({
  selector: 'app-edit-project-form-page',
  template: `
    <app-reusable-project-form
      *ngIf="formData$ | async as formData"
      [formData]="formData"
      (afterFormInit)="form = $event" />

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
        {{ 'ui.form.action.submit' | translate }}
      </button>
    </div>
  `,
})
export class EditProjectFormPageComponent {
  form: ProjectForm;
  loading = false;
  formData$ = this._route.parent.parent.paramMap.pipe(
    map(params => params.get(RouteConstants.uuidParameter)),
    map(uuid => this._projectService.uuidToIri(uuid)),
    switchMap(iri => this._projectApiService.get(iri)),
    map(project => project.project),
    map(project => {
      return {
        shortcode: project.shortcode,
        shortname: project.shortname,
        longname: project.longname,
        description: project.description as MultiLanguages,
        keywords: project.keywords,
      };
    })
  );

  constructor(
    private _notification: NotificationService,
    private _projectApiService: ProjectApiService,
    private _projectService: ProjectService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _ts: TranslateService
  ) {}

  onSubmit() {
    const projectUuid = this._route.parent.parent.snapshot.paramMap.get(RouteConstants.uuidParameter);
    this._notification.openSnackBar(this._ts.instant('pages.project.editProjectFormPage.editSuccess'));
    this._router.navigate([`${RouteConstants.projectRelative}/${projectUuid}`]);
  }
}
