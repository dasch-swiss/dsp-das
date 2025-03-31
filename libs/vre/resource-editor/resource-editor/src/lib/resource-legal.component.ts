import { Component, Input, OnInit } from '@angular/core';
import { getFileValue } from '@dasch-swiss/vre/resource-editor/representations';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-resource-legal',
  template: ` <div>Copyright holder {{ legalInfos.copyrightHolder }}</div>
    <div style="display: flex; justify-content: space-between">
      <div>License {{ legalInfos.license.labelEn }}</div>
      <div>Licensed on {{ resource.res.creationDate }}</div>
    </div>
    <div>Authorship {{ legalInfos.authorship }}</div>`,
})
export class ResourceLegalComponent implements OnInit {
  @Input({ required: true }) resource!: DspResource;

  get legalInfos() {
    return getFileValue(this.resource);
  }

  ngOnInit() {
    console.log(this.resource);
  }
}
