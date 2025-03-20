import { Component, Input } from '@angular/core';
import { ReadProject } from '@dasch-swiss/dsp-js';
import { AdminProjectsLegalInfoApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { filter, finalize, map, switchMap, take } from 'rxjs/operators';
import { CreateResourceFormInterface } from './create-resource-form.interface';

@Component({
  selector: 'app-create-resource-form-legal',
  template: `
    <h3>Legal infos</h3>

    <app-create-resource-form-row [label]="'Copyright holder'" [tooltip]="'Copyright holder'">
      <mat-form-field>
        <mat-select placeholder="Choose" [formControl]="formGroup.controls.copyrightHolder">
          <mat-option *ngIf="copyrightHoldersLoading">Loading...</mat-option>
          <mat-option *ngFor="let copyrightHolder of copyrightHolders$ | async" [value]="copyrightHolder"
            >{{ copyrightHolder }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </app-create-resource-form-row>

    <app-create-resource-form-row [label]="'License'" [tooltip]="'License'">
      <mat-form-field>
        <mat-select placeholder="Choose" [formControl]="formGroup.controls.license">
          <mat-option *ngIf="licensesLoading">Loading...</mat-option>
          <mat-option *ngFor="let license of licenses$ | async" [value]="license">{{ license.labelEn }} </mat-option>
        </mat-select>
      </mat-form-field>
    </app-create-resource-form-row>

    <app-create-resource-form-row [label]="'Authorship'" [tooltip]="'Authorship'">
      <app-authorship-form-field />
    </app-create-resource-form-row>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class CreateResourceFormLegalComponent {
  @Input({ required: true }) formGroup!: CreateResourceFormInterface['legal'];

  readonly project$ = this._store.select(ProjectsSelectors.currentProject).pipe(
    filter(project => project !== undefined),
    map(project => project as ReadProject),
    take(1)
  );

  copyrightHoldersLoading = true;
  licensesLoading = true;

  copyrightHolders$ = this.project$.pipe(
    switchMap(project =>
      this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoCopyrightHolders(project.shortcode)
    ),
    map(data => data.data),
    finalize(() => {
      this.copyrightHoldersLoading = false;
    })
  );

  licenses$ = this.project$.pipe(
    switchMap(project =>
      this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoLicenses(project.shortcode)
    ),
    map(data => data.data),
    finalize(() => {
      this.licensesLoading = false;
    })
  );

  authorships$ = this.project$.pipe(
    switchMap(project =>
      this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoAuthorships(project.shortcode)
    ),
    map(data => data.data)
  );

  constructor(
    private _store: Store,
    private _copyrightApi: AdminProjectsLegalInfoApiService
  ) {}
}
