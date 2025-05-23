import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StringLiteral } from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { LoadListsInProjectAction } from '@dasch-swiss/vre/core/state';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { ListInfoForm } from './list-info-form.type';

@Component({
  selector: 'app-create-list-info-page',
  template: `
    <app-centered-layout>
      <app-reusable-list-info-form
        [formData]="{
          labels: [],
          comments: [],
        }"
        (afterFormInit)="form = $event" />

      <div style="display: flex; justify-content: flex-end">
        <button
          mat-raised-button
          type="submit"
          color="primary"
          [disabled]="form.invalid"
          (click)="submitForm()"
          appLoadingButton
          [isLoading]="loading"
          data-cy="submit-button">
          {{ 'ui.form.action.submit' | translate }}
        </button>
      </div>
    </app-centered-layout>
  `,
})
export class CreateListInfoPageComponent {
  form: ListInfoForm;
  loading = false;

  constructor(
    private _listApiService: ListApiService,
    private _route: ActivatedRoute,
    private _store: Store,
    private _projectService: ProjectService,
    private _router: Router
  ) {}

  submitForm() {
    this.loading = true;
    const projectIri = this._projectService.uuidToIri(this._route.parent.snapshot.paramMap.get('uuid'));

    this._listApiService
      .create({
        projectIri,
        labels: this.form.value.labels as StringLiteral[],
        comments: this.form.value.comments as StringLiteral[],
      })
      .subscribe(response => {
        this._store.dispatch(new LoadListsInProjectAction(projectIri));
        this.loading = false;

        const array = response.list.listinfo.id.split('/');
        const name = array[array.length - 1];
        this._router.navigate([RouteConstants.list, name], {
          relativeTo: this._route.parent,
        });
      });
  }
}
