import { Injectable } from '@angular/core';
import { ReadResource, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { IncomingService } from '@dasch-swiss/vre/shared/app-common-to-move';
import { Observable } from 'rxjs';
import { expand, map, reduce, takeWhile } from 'rxjs/operators';
import { IncomingOrStandoffLink } from './incoming-link.interface';
import { sortByKeys } from './sortByKeys';

@Injectable()
export class PropertiesDisplayIncomingLinkService {
  constructor(private _incomingService: IncomingService) {}

  getIncomingLinks$(resourceId: string, offset: number): Observable<IncomingOrStandoffLink[]> {
    return this._incomingService.getIncomingLinksForResource(resourceId, offset).pipe(
      map(incomingResources => {
        const array = (incomingResources as ReadResourceSequence).resources.map(resource => {
          return this._createIncomingOrStandoffLink(resource);
        });

        return sortByKeys(array, ['project', 'label']);
      })
    );
  }

  getIncomingLinksRecursively$(resourceId: string, offset: number): Observable<IncomingOrStandoffLink[]> {
    let pageNo = 0;
    return this._incomingService.getIncomingLinksForResource(resourceId, pageNo).pipe(
      expand(() => {
        return (
          this._incomingService.getIncomingLinksForResource(resourceId, pageNo++) as Observable<ReadResourceSequence>
        ).pipe(takeWhile(response => response.resources.length > 0 && response.mayHaveMoreResults === true, true));
      }),
      takeWhile(response => response.resources.length > 0 && response.mayHaveMoreResults === true, true),
      reduce((all: ReadResource[], data) => all.concat(data.resources), []),
      map(incomingResources => {
        const standOffLinks = incomingResources.map(resource => this._createIncomingOrStandoffLink(resource));
        return sortByKeys(standOffLinks, ['project', 'label']);
      })
    );
  }

  private _createIncomingOrStandoffLink(resource: ReadResource): IncomingOrStandoffLink {
    const resourceIdPathOnly = resource.id.match(/[^\/]*\/[^\/]*$/);
    if (!resourceIdPathOnly) {
      throw new Error('Resource id is not in the expected format');
    }

    return {
      label: resource.label,
      uri: `/resource/${resourceIdPathOnly[0]}`,
      project: resource.resourceClassLabel ? resource.resourceClassLabel : '',
    };
  }
}
