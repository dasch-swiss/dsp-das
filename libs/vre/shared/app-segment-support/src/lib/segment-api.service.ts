import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AccessTokenService } from '@dasch-swiss/vre/shared/app-session';

@Injectable({
  providedIn: 'root',
})
export class SegmentApiService {
  constructor(
    private _http: HttpClient,
    private _accessTokenService: AccessTokenService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  create() {
    const bearerToken = this._accessTokenService.getAccessToken();
    const headerOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      }),
    };

    return this._http.post(
      'http://0.0.0.0:3333/v2/resources',
      {
        '@type': 'http://api.knora.org/ontology/knora-api/v2#VideoSegment',
        'http://www.w3.org/2000/01/rdf-schema#label': 'segment',
        'http://api.knora.org/ontology/knora-api/v2#attachedToProject': {
          '@id': 'http://rdfh.ch/projects/0803',
        },
        'http://api.knora.org/ontology/knora-api/v2#isVideoSegmentOfValue': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#LinkValue',
          'http://api.knora.org/ontology/knora-api/v2#linkValueHasTargetIri': {
            '@id': 'http://rdfh.ch/0803/O5J50GVGTZ2W4ZyC5ZM5HQ',
          },
        },
        'http://api.knora.org/ontology/knora-api/v2#hasSegmentBounds': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#IntervalValue',
          'http://api.knora.org/ontology/knora-api/v2#intervalValueHasStart': {
            '@value': '0.0',
            '@type': 'http://www.w3.org/2001/XMLSchema#decimal',
          },
          'http://api.knora.org/ontology/knora-api/v2#intervalValueHasEnd': {
            '@value': '10.0',
            '@type': 'http://www.w3.org/2001/XMLSchema#decimal',
          },
        },
        'http://api.knora.org/ontology/knora-api/v2#hasComment': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
          'http://api.knora.org/ontology/knora-api/v2#valueAsString': 'COMMENT',
        },
        'http://api.knora.org/ontology/knora-api/v2#hasTitle': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
          'http://api.knora.org/ontology/knora-api/v2#valueAsString': 'title',
        },
        'http://api.knora.org/ontology/knora-api/v2#hasDescription': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
          'http://api.knora.org/ontology/knora-api/v2#valueAsString': 'description',
        },
        'http://api.knora.org/ontology/knora-api/v2#hasKeyword': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
          'http://api.knora.org/ontology/knora-api/v2#valueAsString': 'keyword',
        },
      },
      headerOptions
    );
  }

  getSegment(resourceIri: string) {
    const payload = `
PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>


CONSTRUCT {
  ?segment knora-api:isMainResource true .
  ?segment knora-api:isVideoSegmentOf <${resourceIri}> .
  ?segment knora-api:hasSegmentBounds ?bounds .
  ?segment knora-api:hasTitle ?title .
  ?segment knora-api:hasDescription ?description .
  ?segment knora-api:hasKeyword ?keyword .
  ?segment knora-api:hasComment ?comment .
  ?segment knora-api:relatesTo ?relatesTo .
} WHERE {
  <${resourceIri}> a knora-api:MovingImageRepresentation .
  ?segment knora-api:isVideoSegmentOf <${resourceIri}> .
  ?segment rdfs:label ?label .
  ?segment knora-api:hasSegmentBounds ?bounds

  OPTIONAL {
    ?segment knora-api:hasTitle ?title .
  }
  OPTIONAL {
    ?segment knora-api:hasDescription ?description .
  }
  OPTIONAL {
    ?segment knora-api:hasKeyword ?keyword .
  }
  OPTIONAL {
    ?segment knora-api:hasComment ?comment .
  }
   OPTIONAL {
    ?segment knora-api:relatesTo ?relatesTo .
  }

}
OFFSET 0
`;

    return this._dspApiConnection.v2.search.doExtendedSearch(payload);
  }

  private _auth() {
    const bearerToken = this._accessTokenService.getAccessToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/sparql-query; charset=UTF-8',
        Accept: '*/*',
        Authorization: `Bearer ${bearerToken}`,
      }),
    };
  }
}
