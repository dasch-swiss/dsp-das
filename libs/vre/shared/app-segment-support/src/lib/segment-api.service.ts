import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  KnoraApiConnection,
  ReadIntervalValue,
  ReadResourceSequence,
  ReadTextValueAsString,
} from '@dasch-swiss/dsp-js';
import { AppConfigService, DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AccessTokenService } from '@dasch-swiss/vre/shared/app-session';
import { map } from 'rxjs/operators';
import { Segment } from './segment';

@Injectable({
  providedIn: 'root',
})
export class SegmentApiService {
  constructor(
    private _http: HttpClient,
    private _accessTokenService: AccessTokenService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _appConfig: AppConfigService
  ) {}

  apiHost = this._appConfig.dspApiConfig.apiHost;
  apiPort = this._appConfig.dspApiConfig.apiPort;
  projectIri = 'http://rdfh.ch/projects/vNYc6-z_ST-a_ENjDxSZjQ';

  create(
    resourceIri: string,
    label: string,
    start: number,
    end: number,
    comment?: string,
    title?: string,
    description?: string,
    keyword?: string
  ) {
    const bearerToken = this._accessTokenService.getAccessToken();
    const headerOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      }),
    };

    return this._http.post(
      'https://api.dev.dasch.swiss/v2/resources',
      {
        '@type': 'http://api.knora.org/ontology/knora-api/v2#VideoSegment',
        'http://www.w3.org/2000/01/rdf-schema#label': label,
        'http://api.knora.org/ontology/knora-api/v2#attachedToProject': {
          '@id': this.projectIri,
        },
        'http://api.knora.org/ontology/knora-api/v2#isVideoSegmentOfValue': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#LinkValue',
          'http://api.knora.org/ontology/knora-api/v2#linkValueHasTargetIri': {
            '@id': resourceIri,
          },
        },
        'http://api.knora.org/ontology/knora-api/v2#hasSegmentBounds': {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#IntervalValue',
          'http://api.knora.org/ontology/knora-api/v2#intervalValueHasStart': {
            '@value': start.toString(),
            '@type': 'http://www.w3.org/2001/XMLSchema#decimal',
          },
          'http://api.knora.org/ontology/knora-api/v2#intervalValueHasEnd': {
            '@value': end.toString(),
            '@type': 'http://www.w3.org/2001/XMLSchema#decimal',
          },
        },
        ...(comment
          ? {
              'http://api.knora.org/ontology/knora-api/v2#hasComment': {
                '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
                'http://api.knora.org/ontology/knora-api/v2#valueAsString': comment,
              },
            }
          : {}),
        ...(title
          ? {
              'http://api.knora.org/ontology/knora-api/v2#hasTitle': {
                '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
                'http://api.knora.org/ontology/knora-api/v2#valueAsString': title,
              },
            }
          : {}),
        ...(description
          ? {
              'http://api.knora.org/ontology/knora-api/v2#hasDescription': {
                '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
                'http://api.knora.org/ontology/knora-api/v2#valueAsString': description,
              },
            }
          : {}),
        ...(keyword
          ? {
              'http://api.knora.org/ontology/knora-api/v2#hasKeyword': {
                '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
                'http://api.knora.org/ontology/knora-api/v2#valueAsString': keyword,
              },
            }
          : {}),
      },
      headerOptions
    );
  }

  getVideoSegment(resourceIri: string) {
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

    return this._dspApiConnection.v2.search.doExtendedSearch(payload).pipe(
      map(value => {
        const endpoint = 'http://api.knora.org/ontology/knora-api/v2#';

        return (value as ReadResourceSequence).resources.map(resource => {
          this.projectIri = resource.attachedToProject;
          console.log(999, resource);
          const data = {
            hasSegmentBounds: resource.properties[`${endpoint}hasSegmentBounds`] as ReadIntervalValue[],
            hasVideoSegmentOfValue: resource.properties[`${endpoint}hasVideoSegmentOfValue`] as
              | ReadTextValueAsString[]
              | undefined,
            hasComment: resource.properties[`${endpoint}hasComment`] as ReadTextValueAsString[] | undefined,
            hasDescription: resource.properties[`${endpoint}hasDescription`] as ReadTextValueAsString[] | undefined,
            hasKeyword: resource.properties[`${endpoint}hasKeyword`] as ReadTextValueAsString[] | undefined,
            hasTitle: resource.properties[`${endpoint}hasTitle`] as ReadTextValueAsString[] | undefined,
          };

          const mappedObject = Object.entries(data).reduce((acc, [key, value_]) => {
            acc[key] = value_ !== undefined ? value_![0] : undefined;
            return acc;
          }, {});

          return { ...mappedObject, label: resource.label } as Segment;
        });
      })
    );
  }
}
