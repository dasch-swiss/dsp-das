import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { MultiLanguages } from '@dasch-swiss/vre/ui/string-literal';
import { map } from 'rxjs';
import { ProjectPageService } from '../project-page.service';
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
  form!: ProjectForm;
  loading = false;
  formData$ = this._projectPageService.currentProject$.pipe(
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
    private _projectPageService: ProjectPageService,
    private _router: Router
  ) {}

  onSubmit() {
    this._projectPageService.currentProjectUuid$.subscribe(projectUuid => {
      this._router.navigate([`${RouteConstants.projectRelative}/${projectUuid}`]);
    });
  }
}
