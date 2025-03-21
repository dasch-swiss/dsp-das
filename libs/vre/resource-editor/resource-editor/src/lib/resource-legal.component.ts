import { Component, Input } from '@angular/core';
import { Constants, ReadFileValue } from '@dasch-swiss/dsp-js';
import { FileRepresentation } from '@dasch-swiss/vre/resource-editor/representations';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-resource-legal',
  template: ` <h2>Legal infos</h2>
    <div>Copyright holder {{ legalInfos.copyrightHolder }}</div>
    <div>License {{ license }}</div>
    <div>Licensed on {{ licensedOn }}</div>
    <div>Authorship {{ authorship }}</div>`,
})
export class ResourceLegalComponent {
  @Input({ required: true }) resource!: DspResource;
  @Input({ required: true }) representationToDisplay!: FileRepresentation;

  get legalInfos() {
    return this.resource.res.properties[Constants.HasStillImageFileValue][0] as unknown as ReadFileValue;
  }

  copyrightHolder = 'copyrightHolderTODO';
  license = 'license';
  licensedOn = 'licensedOn';
  authorship = 'authorship';
}
