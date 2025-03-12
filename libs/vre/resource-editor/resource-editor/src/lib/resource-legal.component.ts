import { Component, Input } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-resource-legal',
  template: ` <h2>Legal infos</h2>
    <div>Copyright holder {{ copyrightHolder }}</div>
    <div>License {{ license }}</div>
    <div>Licensed on {{ licensedOn }}</div>
    <div>Authorship {{ authorship }}</div>`,
})
export class ResourceLegalComponent {
  @Input({ required: true }) resource!: DspResource;
  copyrightHolder = 'copyrightHolderTODO';
  license = 'license';
  licensedOn = 'licensedOn';
  authorship = 'authorship';
}
