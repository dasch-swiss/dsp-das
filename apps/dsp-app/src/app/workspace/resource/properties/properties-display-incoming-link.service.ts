import { Injectable } from '@angular/core';
import { ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IncomingService } from '@dsp-app/src/app/workspace/resource/services/incoming.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IncomingLink {
  label: string;
  uri: string;
  project: string;
}

@Injectable()
export class PropertiesDisplayIncomingLinkService {
  resource: DspResource;

  constructor(private _incomingService: IncomingService) {}

  getIncomingLinks$(resourceId: string, offset: number): Observable<IncomingLink[]> {
    return this._incomingService.getIncomingLinksForResource(resourceId, offset).pipe(
      map(incomingResources => {
        return (incomingResources as ReadResourceSequence).resources.map(resource => {
          return {
            label: resource.label,
            uri: resource.id.match(/[^\/]*\/[^\/]*$/)[0],
            project: resource.attachedToProject,
          };
        });
      })
    );
  }
}
