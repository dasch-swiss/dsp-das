import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  AdminProjectsLegalInfoApiService,
  Authorship,
  CopyrightHolder,
  LicenseDto,
} from '@dasch-swiss/vre/3rd-party-services/open-api';
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
    <h2>
      Copyright holders
      <button color="primary" mat-raised-button (click)="addCopyrightHolder()">Add (copyright holder)</button>
    </h2>
    <div *ngFor="let item of copyrightHolders$ | async">{{ item.value }}</div>
    <div *ngFor="let item of licenses$ | async">{{ item.label_en }} <a [href]="item.uri">link</a></div>
    <div *ngFor="let item of authorships$ | async">{{ item.value }}</div>
  `,
})
export class LegalSettingsComponent implements OnInit {
  project$ = this._store.select(ProjectsSelectors.currentProject);

  copyrightHolders$ = this.project$.pipe(
    filter(project => project !== undefined),
    switchMap(project =>
      this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoCopyrightHolders(project!.shortcode)
    ),
    map(data => data.data as CopyrightHolder[])
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
    map(data => data.data as Authorship[])
  );

  constructor(
    private _dialog: MatDialog,
    private _copyrightApi: AdminProjectsLegalInfoApiService,
    private _store: Store
  ) {}

  ngOnInit() {
    console.log(this);
  }

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
