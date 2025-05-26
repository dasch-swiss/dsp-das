import { Component } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ReadProject } from '@dasch-swiss/dsp-js';
import { AdminProjectsLegalInfoApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-legal-settings-licenses',
  template: `
    <table style="width: 100%">
      <tr style="text-align: left">
        <th>Label</th>
        <th>Recommended</th>
        <th>Enabled for project</th>
      </tr>
      <tr *ngFor="let item of licenses$ | async">
        <td>
          {{ item.labelEn }}
          <a [href]="item.uri" target="_blank">
            <mat-icon>launch</mat-icon>
          </a>
        </td>
        <td>
          <mat-icon *ngIf="item.isRecommended" [color]="'accent'">thumb_up</mat-icon>
          <mat-icon *ngIf="!item.isRecommended">thumb_down</mat-icon>
        </td>
        <td>
          <mat-checkbox [checked]="item.isEnabled" (change)="editEnableStatus($event, item.id)"></mat-checkbox>
        </td>
      </tr>
    </table>
  `,
})
export class LegalSettingsLicensesComponent {
  private readonly _reloadSubject = new BehaviorSubject<void>(undefined);

  readonly project$ = this._reloadSubject.asObservable().pipe(
    switchMap(() => this._store.select(ProjectsSelectors.currentProject)),
    filter(project => project !== undefined),
    map(project => project as ReadProject)
  );

  licenses$ = this.project$.pipe(
    switchMap(project =>
      this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoLicenses(project.shortcode)
    ),
    map(data => data.data)
  );

  constructor(
    private _copyrightApi: AdminProjectsLegalInfoApiService,
    private _store: Store
  ) {}

  editEnableStatus(event: MatCheckboxChange, licenseIri: string) {
    console.log(event);
    const isEnabled = event.checked;
    this.project$
      .pipe(
        switchMap(project => {
          if (isEnabled) {
            return this._copyrightApi.putAdminProjectsShortcodeProjectshortcodeLegalInfoLicensesLicenseiriEnable(
              project.shortcode,
              licenseIri
            );
          } else {
            return this._copyrightApi.putAdminProjectsShortcodeProjectshortcodeLegalInfoLicensesLicenseiriDisable(
              project.shortcode,
              licenseIri
            );
          }
        })
      )
      .subscribe();
  }
}
