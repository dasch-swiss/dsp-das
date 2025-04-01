import { Component, Input, OnInit } from '@angular/core';
import { ReadFileValue } from '@dasch-swiss/dsp-js';
import { getFileValue } from '@dasch-swiss/vre/resource-editor/representations';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-resource-legal',
  template: ` <div
    class="mat-caption"
    style="border: 1px solid #292929;
    background: #292929; border-radius: 8px;
    color: #e4e9ed; padding: 8px; padding-bottom: 16px; margin-top: 8px; position: relative; top: 12px">
    <div style="display: flex; justify-content: space-between">
      <div>
        <div *ngIf="true || fileValue.copyrightHolder !== ''">
          <span class="label">Copyright holder</span> {{ fileValue.copyrightHolder }} Julien Schneider
        </div>

        <div *ngIf="true || fileValue.authorship.length > 0">
          <span class="label">Authorship</span>
          <span>Julien,</span>
          <span>Dominique,</span>
          <span>Irmantas</span>
          <span *ngFor="let author of fileValue.authorship; let last = last">{{ author }}{{ last ? '' : ', ' }}</span>
        </div>
      </div>
      <div>
        <div style="display: flex; justify-content: flex-end">
          <img
            src="http://mirrors.creativecommons.org/presskit/buttons/80x15/svg/by-sa.svg"
            alt="license"
            *ngIf="false"
            style="width: 110px" />
          <span style="display: flex; align-items: center">
            <a
              href="test"
              style="color: white; text-decoration: underline; display: flex; align-items: center"
              *ngIf="true"
              >AI License
              <mat-icon style="font-size: 15px; height: 15px; width: 15px;">open_in_new</mat-icon>
            </a>
          </span>
        </div>

        <div>Licensed on {{ resource.res.creationDate | humanReadableDate }}</div>
      </div>
    </div>
  </div>`,
  styles: ['.label { display: inline-block; width: 120px; font-weight: bold}'],
})
export class ResourceLegalComponent implements OnInit {
  @Input({ required: true }) resource!: DspResource;

  fileValue!: ReadFileValue;
  licenseExists!: boolean;

  ngOnInit() {
    this.fileValue = getFileValue(this.resource);
    this.licenseExists = true; // this.fileValue.license.id !== '';
  }
}
