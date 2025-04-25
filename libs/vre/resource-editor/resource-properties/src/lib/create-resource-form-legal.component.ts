import { Component, Input, OnInit } from '@angular/core';
import { AdminProjectsLegalInfoApiService, LicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { Observable } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { CreateResourceFormLegal } from './create-resource-form.interface';

@Component({
  selector: 'app-create-resource-form-legal',
  template: `
    <app-create-resource-form-row [label]="'Copyright holder'" [tooltip]="'Copyright holder'">
      <mat-form-field>
        <mat-select
          placeholder="Choose"
          [formControl]="formGroup.controls.copyrightHolder"
          data-cy="copyright-holder-select">
          <mat-option *ngIf="copyrightHoldersLoading">Loading...</mat-option>
          <mat-option *ngFor="let copyrightHolder of copyrightHolders$ | async" [value]="copyrightHolder"
            >{{ copyrightHolder }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </app-create-resource-form-row>

    <app-create-resource-form-row [label]="'License'" [tooltip]="'License'">
      <mat-form-field>
        <mat-select placeholder="Choose" [formControl]="formGroup.controls.license" data-cy="license-select">
          <mat-option *ngIf="licensesLoading">Loading...</mat-option>
          <mat-option *ngFor="let license of licenses$ | async" [value]="license">{{ license.labelEn }} </mat-option>
        </mat-select>
      </mat-form-field>
    </app-create-resource-form-row>

    <app-create-resource-form-row [label]="'Authorship'" [tooltip]="'Authorship'">
      <app-authorship-form-field [control]="formGroup.controls.authorship" />
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
export class CreateResourceFormLegalComponent implements OnInit {
  @Input({ required: true }) formGroup!: CreateResourceFormLegal;

  copyrightHoldersLoading = true;
  licensesLoading = true;

  copyrightHolders$!: Observable<string[]>;
  licenses$!: Observable<LicenseDto[]>;
  authorship$!: Observable<string[]>;

  constructor(
    private _copyrightApi: AdminProjectsLegalInfoApiService,
    private resourceFetcherService: ResourceFetcherService
  ) {}

  ngOnInit() {
    this.copyrightHolders$ = this.resourceFetcherService.projectShortcode$.pipe(
      switchMap(projectShortcode =>
        this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoCopyrightHolders(projectShortcode)
      ),
      map(data => data.data),
      finalize(() => {
        this.copyrightHoldersLoading = false;
      })
    );

    this.licenses$ = this.resourceFetcherService.projectShortcode$.pipe(
      switchMap(projectShortcode =>
        this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoLicenses(projectShortcode)
      ),
      map(data => data.data),
      finalize(() => {
        this.licensesLoading = false;
      })
    );

    this.authorship$ = this.resourceFetcherService.projectShortcode$.pipe(
      switchMap(projectShortcode =>
        this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoAuthorships(projectShortcode)
      ),
      map(data => data.data)
    );
  }
}
