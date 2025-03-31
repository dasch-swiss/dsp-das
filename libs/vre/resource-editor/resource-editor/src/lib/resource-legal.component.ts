import { Component, Input, OnInit } from '@angular/core';
import { ReadFileValue } from '@dasch-swiss/dsp-js';
import { getFileValue, ResourceUtil } from '@dasch-swiss/vre/resource-editor/representations';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-resource-legal',
  template: ` <div *ngIf="userCanEdit || fileValue.copyrightHolder !== ''">
      Copyright holder {{ fileValue.copyrightHolder }}
    </div>
    <div style="display: flex; justify-content: space-between" *ngIf="userCanEdit || licenseExists">
      <div>License {{ fileValue.license.labelEn }}</div>
      <div>Licensed on {{ resource.res.creationDate | humanReadableDate }}</div>
    </div>
    <div *ngIf="userCanEdit || fileValue.authorship.length > 0">
      Authorship
      <span *ngFor="let author of fileValue.authorship; let last = last">{{ author }}{{ last ? '' : ',' }}</span>
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
