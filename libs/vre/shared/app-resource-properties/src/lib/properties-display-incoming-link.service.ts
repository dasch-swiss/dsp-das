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
    return this._getIncomingLinks$(resourceId, offset);
  }

  getIncomingLinksRecursively$(resourceId: string, offset: number): Observable<IncomingOrStandoffLink[]> {
    const incomingLinks$ = this._incomingService.getIncomingLinksForResource(resourceId, offset).pipe(
      expand(response =>
        this._incomingService.getIncomingLinksForResource(resourceId, offset++).pipe(
          map(incomingResources => {
            const array = (incomingResources as ReadResourceSequence).resources.map(resource => {
              return this._createIncomingOrStandoffLink(resource);
            });

            return sortByKeys(array, ['project', 'label']);
          })
        )
      ),
      takeWhile(response => response.mayHaveMoreResults, true),
      reduce((all, { data }) => all.concat(data), [])
    );

    return this._incomingService.getIncomingLinksForResource(resourceId, offset).pipe(
      map(incomingResources => {
        const array = (incomingResources as ReadResourceSequence).resources.map(resource => {
          return this._createIncomingOrStandoffLink(resource);
        });

        return sortByKeys(array, ['project', 'label']);
      })
    );
  }

  private _getIncomingLinks$(resourceId: string, offset: number): Observable<IncomingOrStandoffLink[]> {
    return this._incomingService.getIncomingLinksForResource(resourceId, offset).pipe(
      map(incomingResources => {
        const array = (incomingResources as ReadResourceSequence).resources.map(resource => {
          return this._createIncomingOrStandoffLink(resource);
        });

        return sortByKeys(array, ['project', 'label']);
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
