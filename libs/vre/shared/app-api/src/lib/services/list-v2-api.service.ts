import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApi } from './base-api';
import { mergeMap } from 'rxjs/operators';
import { ListNodeV2 } from '@dasch-swiss/dsp-js';
import * as jsonld from 'jsonld';

// Now you can use the jsonld object as you would in JavaScript

@Injectable({
    providedIn: 'root'
})
export class ListV2ApiService extends BaseApi {
    constructor(private _http: HttpClient) {
        super('lists');
    }

    getNode(nodeIri: string) {
        return this._http.get(`${this.baseUri}/node/${encodeURIComponent(nodeIri)}`).pipe(
            mergeMap((response ) => {
                return jsonld.compact(response, {}) as unknown as Promise<ListNodeV2>;
            }));
    }

    getList(nodeIri: string) {
        return this._http.get(`${this.baseUri}/lists/${encodeURIComponent(nodeIri)}`).pipe(
            mergeMap((response) => {
                return jsonld.compact(response, {}) as unknown as Promise<ListNodeV2>;
            }));
    }
}
