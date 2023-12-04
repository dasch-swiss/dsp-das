import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApi } from '../base-api';
import { map, mergeMap, tap } from 'rxjs/operators';
import { ListNodeV2 } from '@dasch-swiss/dsp-js';
import { compact } from 'jsonld';
import { JsonConvert, OperationMode, PropertyMatchingRule, ValueCheckingMode } from 'json2typescript';

// Now you can use the jsonld object as you would in JavaScript

@Injectable({
    providedIn: 'root'
})
export class ListV2ApiService extends BaseApi {
    constructor(private _http: HttpClient) {
        super('v2'); // TODO weird
    }

    getNode(nodeIri: string) {
        return this._http.get<ListNodeV2>(`${this.baseUri}/node/${encodeURIComponent(nodeIri)}`);
    }

    getList(nodeIri: string) {
        return this._http.get(`${this.baseUri}/lists/${encodeURIComponent(nodeIri)}`).pipe(
            tap(v => console.log('before', v)),
            mergeMap((response) => compact(response, {}) as unknown as Promise<ListNodeV2>),
            tap(v => console.log('after', v)));
    }
}
