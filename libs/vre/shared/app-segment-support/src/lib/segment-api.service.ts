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

  getSegment() {
    const payload = `
PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>

CONSTRUCT {
?page knora-api:isMainResource true .

?page knora-api:seqnum ?seqnum .

?page knora-api:hasStillImageFile ?file .
} WHERE {

?page a knora-api:StillImageRepresentation .
?page a knora-api:Resource .

?page knora-api:isPartOf <http://rdfh.ch/0801/--rbZIzLTNC4qrcpAAkjwA> .
knora-api:isPartOf knora-api:objectType knora-api:Resource .

<http://rdfh.ch/0801/--rbZIzLTNC4qrcpAAkjwA> a knora-api:Resource .

?page knora-api:seqnum ?seqnum .
knora-api:seqnum knora-api:objectType xsd:integer .

?seqnum a xsd:integer .

?page knora-api:hasStillImageFile ?file .
knora-api:hasStillImageFile knora-api:objectType knora-api:File .

?file a knora-api:File .

} ORDER BY ?seqnum
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
