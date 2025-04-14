import { Component, Input, OnChanges } from '@angular/core';
import { ReadFileValue } from '@dasch-swiss/dsp-js';
import { LicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { getFileValue } from '@dasch-swiss/vre/resource-editor/representations';
import { ProjectCommonService } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { Subscription } from 'rxjs';
import { LicensesLogoMapping } from './licenses-logo-mapping';

@Component({
  selector: 'app-resource-legal',
  template: `
    <div
      *ngIf="fileValue.copyrightHolder !== '' || fileValue.authorship.length > 0 || fileValue.license !== null"
      class="mat-caption"
      style="border: 1px solid #292929;
    background: #292929; border-radius: 8px;
    color: #e4e9ed; padding: 8px; padding-bottom: 16px; margin-top: 8px; position: relative; top: 12px">
      <div style="display: flex; justify-content: space-between">
        <div>
          <div *ngIf="fileValue.copyrightHolder !== ''">
            <span class="label">Copyright holder</span> {{ fileValue.copyrightHolder }}
          </div>

          <div *ngIf="fileValue.authorship.length > 0" style="display: flex">
            <span class="label">Authorship</span>
            <div style="max-width: 400px">
              <span *ngFor="let author of fileValue.authorship; let last = last"
                >{{ author }}{{ last ? '' : ', ' }}</span
              >
            </div>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: flex-end">
            <img *ngIf="licenseLogo; else licenseWithLinkTpl" [src]="licenseLogo" alt="license" style="width: 110px" />
          </div>

          <div>Licensed on {{ fileValue.valueCreationDate | humanReadableDate }}</div>
        </div>
      </div>
    </div>
    <ng-template #licenseWithLinkTpl>
      <span style="display: flex; align-items: center" *ngIf="license">
        <a
          [href]="license.uri"
          style="color: white; text-decoration: underline; display: flex; align-items: center"
          target="_blank"
          >{{ license.labelEn }}
          <mat-icon style="font-size: 15px; height: 15px; width: 15px;">open_in_new</mat-icon>
        </a>
      </span></ng-template
    >
  `,
  styles: ['.label { display: inline-block; width: 120px; font-weight: bold}'],
})
export class ResourceLegalComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;

  fileValue!: ReadFileValue;

  licenseLogo?: string;
  licenses?: LicenseDto[];
  license?: LicenseDto;

  subscription?: Subscription;

  constructor(public projectCommon: ProjectCommonService) {}

  ngOnChanges() {
    this.projectCommon.onInit('0803'); // TODO BAD CODE!
    this.fileValue = getFileValue(this.resource.res);

    this.subscription?.unsubscribe();

    if (this.fileValue.license !== null) {
      if (LicensesLogoMapping.has(this.fileValue.license.id)) {
        this.licenseLogo = LicensesLogoMapping.get(this.fileValue.license.id);
      } else {
        this._fetchLicense();
      }
    }
  }

  private _fetchLicense() {
    this.subscription = this.projectCommon.licenses$?.subscribe(licenses => {
      this.licenses = licenses;
      this.license = this.licenses?.find(license => license.id === this.fileValue.license?.id);
    });
  }
}
