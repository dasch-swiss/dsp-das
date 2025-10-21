import { Component, inject, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProjectLicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { CreateResourceFormLegal } from '@dasch-swiss/vre/resource-editor/representations';
import { PaginatedApiService } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

@Component({
  selector: 'app-create-resource-form-legal',
  template: `
    <app-create-resource-form-row [label]="'resourceEditor.resourceCreator.legal.copyrightHolder' | translate">
      <mat-form-field>
        <mat-select
          [placeholder]="'resourceEditor.resourceCreator.legal.choose' | translate"
          [formControl]="formGroup.controls.copyrightHolder"
          data-cy="copyright-holder-select">
          @if (copyrightHoldersLoading) {
            <mat-option>{{ 'ui.common.status.loading' | translate }}</mat-option>
          }
          @if (!copyrightHoldersLoading) {
            <mat-option [value]="undefined">{{ 'resourceEditor.resourceCreator.legal.none' | translate }}</mat-option>
          }
          @for (copyrightHolder of copyrightHolders$ | async; track copyrightHolder) {
            <mat-option [value]="copyrightHolder">{{ copyrightHolder }} </mat-option>
          }
        </mat-select>
      </mat-form-field>
    </app-create-resource-form-row>

    <app-create-resource-form-row [label]="'resourceEditor.resourceCreator.legal.licenseStatement' | translate">
      <mat-form-field>
        <mat-select [placeholder]="'resourceEditor.resourceCreator.legal.choose' | translate" [formControl]="formGroup.controls.license" data-cy="license-select">
          @if (licensesLoading) {
            <mat-option>{{ 'ui.common.status.loading' | translate }}</mat-option>
          }
          @if (!licensesLoading) {
            <mat-option [value]="undefined">{{ 'resourceEditor.resourceCreator.legal.none' | translate }}</mat-option>
          }
          @for (license of licenses$ | async; track license) {
            <mat-option [value]="license">{{ license.labelEn }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </app-create-resource-form-row>

    <app-create-resource-form-row [label]="'resourceEditor.resourceCreator.legal.authorship' | translate">
      <app-authorship-form-field [control]="formGroup.controls.authorship" [projectShortcode]="projectShortcode" />
    </app-create-resource-form-row>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `,
  ],
  standalone: false,
})
export class CreateResourceFormLegalComponent implements OnInit {
  @Input({ required: true }) formGroup!: CreateResourceFormLegal;
  @Input({ required: true }) projectShortcode!: string;

  copyrightHoldersLoading = true;
  licensesLoading = true;

  copyrightHolders$!: Observable<string[]>;
  licenses$!: Observable<ProjectLicenseDto[]>;
  authorship$!: Observable<string[]>;

  private readonly _translateService = inject(TranslateService);

  constructor(private readonly _paginatedApi: PaginatedApiService) {}

  ngOnInit() {
    this.copyrightHolders$ = this._paginatedApi.getCopyrightHolders(this.projectShortcode).pipe(
      finalize(() => {
        this.copyrightHoldersLoading = false;
      })
    );

    this.licenses$ = this._paginatedApi.getLicenses(this.projectShortcode).pipe(
      map(data => data.filter(license => license.isEnabled)),
      finalize(() => {
        this.licensesLoading = false;
      })
    );

    this.authorship$ = this._paginatedApi.getAuthorships(this.projectShortcode);
  }
}
