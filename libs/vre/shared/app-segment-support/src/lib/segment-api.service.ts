import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccessTokenService } from '@dasch-swiss/vre/shared/app-session';

@Injectable({
  providedIn: 'root',
})
export class SegmentApiService {
  constructor(
    private _http: HttpClient,
    private _accessTokenService: AccessTokenService
  ) {}

  create() {
    const bearerToken = this._accessTokenService.getAccessToken();
    const httpOptions = {
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
      httpOptions
    );
  }
}
