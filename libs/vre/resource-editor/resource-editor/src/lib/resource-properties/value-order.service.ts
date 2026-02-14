import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@dasch-swiss/vre/core/config';
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
    private readonly _appConfig: AppConfigService
  ) {}

  reorderValues(
    resourceIri: string,
    propertyIri: string,
    orderedValueIris: string[]
  ): Observable<ReorderValuesResponse> {
    const url = `${this._appConfig.dspApiConfig.apiUrl}/v2/values/order`;
    const body: ReorderValuesRequest = {
      resourceIri,
      propertyIri,
      orderedValueIris,
    };

    return this._http.put<ReorderValuesResponse>(url, body);
  }
}
