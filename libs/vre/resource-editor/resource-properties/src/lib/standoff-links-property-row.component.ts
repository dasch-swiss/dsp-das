import { Component, Input, OnChanges } from '@angular/core';
import { Constants, ReadLinkValue } from '@dasch-swiss/dsp-js';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IncomingOrStandoffLink } from './incoming-link.interface';
import { sortByKeys } from './sortByKeys';

@Component({
  selector: 'app-standoff-links-property-row',
  template: ` <app-property-row
    tooltip=" Represent a link in standoff markup from one resource to another"
    label="has Standoff link"
    [containItems]="standoffLinks.length > 0"
    [borderBottom]="true">
    <app-incoming-standoff-link-value [links]="standoffLinks" />
  </app-property-row>`,
})
export class StandoffLinksPropertyRowComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;

  standoffLinks: IncomingOrStandoffLink[] = [];

  ngOnChanges() {
    this.standoffLinks = (
      (this.resource.resProps.find(prop => prop.propDef.id === Constants.HasStandoffLinkToValue)
        ?.values as ReadLinkValue[]) ?? []
    ).map(link => {
      const parts = link.linkedResourceIri.split('/');
      if (parts.length < 2) {
        throw new AppError('Linked resource IRI is not in the expected format');
      }

      const resourceIdPathOnly = parts.slice(-2).join('/');

      return {
        label: link.strval ?? '',
        uri: `/resource/${resourceIdPathOnly}`,
        project: link.linkedResource?.resourceClassLabel ?? '',
      };
    });
    this.standoffLinks = sortByKeys(this.standoffLinks, ['project', 'label']);
  }
}
