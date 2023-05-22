import { Inject, Injectable } from '@angular/core';
import { ApiResponseError, Constants, KnoraApiConnection, OntologiesMetadata } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dsp-app/src/app/main/declarations/dsp-api-tokens';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdvancedSearchService {

  constructor(@Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection)
  { }

  getAllOntologies(): Observable<OntologiesMetadata> {
    return this._dspApiConnection.v2.onto.getOntologiesMetadata().pipe(
        map((response: OntologiesMetadata) => {
          // filter out system ontologies
          response.ontologies = response.ontologies.filter(
            (onto) => onto.attachedToProject !== Constants.SystemProjectIRI
          );

          return response;
        })
      );
  }
}
