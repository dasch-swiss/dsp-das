import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminProjectsLegalInfoApiService, LicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { filter, map, switchMap } from 'rxjs/operators';
import {
  AddCopyrightHolderDialogComponent,
  AddCopyrightHolderDialogProps,
} from './add-copyright-holder-dialog.component';

@Component({
  selector: 'app-legal-settings',
  template: `
    <app-centered-layout>
      <div style="display: flex;justify-content: center; margin: 32px;">
        <div style="border: 1px solid; padding: 16px">Attention: any action you do here is permanent.</div>
      </div>
      <div style="display: flex; justify-content: space-between; gap: 16px">
        <section>
          <h2>
            Copyright holders
            <button color="primary" mat-raised-button (click)="addCopyrightHolder()">Add</button>
          </h2>
          <app-alternated-list>
            <div *ngFor="let item of copyrightHolders$ | async">{{ item }}</div>
          </app-alternated-list>
        </section>
        <section>
          <h2>Licenses</h2>
          <app-alternated-list>
            <div *ngFor="let item of licenses$ | async" style="display: flex; align-items: center; gap: 8px">
              {{ item['label-en'] }}
              <a [href]="item.uri">
                <mat-icon>launch</mat-icon>
              </a>
            </div>
          </app-alternated-list>
        </section>
      </div>
      <h2 style="display: flex; align-items: center; gap: 8px">
        Authorships - Overview
        <mat-icon
          color="primary"
          matTooltip="The authorship overview is read-only. To add a new authorship, please update them directly in the resource.">
          info
        </mat-icon>
      </h2>
      <app-alternated-list>
        <div *ngFor="let item of authorships$ | async">{{ item }}</div>
      </app-alternated-list>
    </app-centered-layout>
  `,
})
export class LegalSettingsComponent {
  readonly project$ = this._store.select(ProjectsSelectors.currentProject);

  copyrightHolders$ = this.project$.pipe(
    filter(project => project !== undefined),
    switchMap(project =>
      this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoCopyrightHolders(project!.shortcode)
    ),
    map(data => data.data as string[])
  );

  licenses$ = this.project$.pipe(
    filter(project => project !== undefined),
    switchMap(project =>
      this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoLicenses(project!.shortcode)
    ),
    map(data => data.data as LicenseDto[])
  );

  authorships$ = this.project$.pipe(
    filter(project => project !== undefined),
    switchMap(project =>
      this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoAuthorships(project!.shortcode)
    ),
    map(data => data.data as string[])
  );

  constructor(
    private _dialog: MatDialog,
    private _copyrightApi: AdminProjectsLegalInfoApiService,
    private _store: Store
  ) {}

  addCopyrightHolder() {
    const currentProject = this._store.selectSnapshot(ProjectsSelectors.currentProject);
    if (!currentProject) {
      throw new AppError('No current project');
    }
    this._dialog.open<AddCopyrightHolderDialogComponent, AddCopyrightHolderDialogProps>(
      AddCopyrightHolderDialogComponent,
      { data: { projectShortcode: currentProject.shortcode } }
    );
  }
}
