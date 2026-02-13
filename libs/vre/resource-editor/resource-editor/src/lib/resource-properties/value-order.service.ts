import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@dasch-swiss/vre/core/config';
import { AccessTokenService } from '@dasch-swiss/vre/core/session';
import { Observable } from 'rxjs';

interface ReorderValuesRequest {
  resourceIri: string;
  propertyIri: string;
  orderedValueIris: string[];
}

interface ReorderValuesResponse {
  resourceIri: string;
  propertyIri: string;
  valuesReordered: number;
}

@Injectable({
  providedIn: 'root',
})
export class ValueOrderService {
  constructor(
    private readonly _http: HttpClient,
    private readonly _appConfig: AppConfigService,
    private readonly _accessTokenService: AccessTokenService
  ) {}

  reorderValues(
    resourceIri: string,
    propertyIri: string,
    orderedValueIris: string[]
  ): Observable<ReorderValuesResponse> {
    const url = `${this._appConfig.dspApiConfig.apiUrl}/v2/values/order`;
    const bearerToken = this._accessTokenService.getAccessToken();
    const headerOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      }),
    };

    const body: ReorderValuesRequest = {
      resourceIri,
      propertyIri,
      orderedValueIris,
    };

    return this._http.put<ReorderValuesResponse>(url, body, headerOptions);
  }
}
