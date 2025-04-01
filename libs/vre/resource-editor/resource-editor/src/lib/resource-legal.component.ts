import { Component, Input, OnInit } from '@angular/core';
import { ReadFileValue } from '@dasch-swiss/dsp-js';
import { getFileValue, ResourceUtil } from '@dasch-swiss/vre/resource-editor/representations';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-resource-legal',
  template: ` <div>Legal infos</div>
    <div
      class="mat-caption"
      style="border: 1px solid gray; padding: 8px; margin-top: 8px; position: relative; top: 5px">
      <div *ngIf="userCanEdit || fileValue.copyrightHolder !== ''">
        Copyright holder {{ fileValue.copyrightHolder }} Julien Schneider
      </div>
      <div style="display: flex; justify-content: space-between" *ngIf="userCanEdit || licenseExists">
        <div>
          License {{ fileValue.license.labelEn }}
          <img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg" />
        </div>
        <div>Licensed on {{ resource.res.creationDate | humanReadableDate }}</div>
      </div>
      <div *ngIf="userCanEdit || fileValue.authorship.length > 0">
        Authorship
        <span>Julien,</span>
        <span>Dominique,</span>
        <span>Irmantas</span>
        <span *ngFor="let author of fileValue.authorship; let last = last">{{ author }}{{ last ? '' : ', ' }}</span>
      </div>
    </div>`,
})
export class ResourceLegalComponent implements OnInit {
  @Input({ required: true }) resource!: DspResource;

  get userCanEdit() {
    return ResourceUtil.userCanEdit(this.resource.res);
  }

  fileValue!: ReadFileValue;
  licenseExists = false;

  ngOnInit() {
    this.fileValue = getFileValue(this.resource);
    this.licenseExists = this.fileValue.license.id !== '';
  }
}
