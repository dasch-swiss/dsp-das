import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApi } from '../base-api';
import { map, mergeMap, tap } from 'rxjs/operators';
import { JsonConvert, OperationMode, PropertyMatchingRule, ValueCheckingMode } from 'json2typescript';
import { ListNodeV2 } from './list-node-v2';
import { compact } from 'jsonld';

// Now you can use the jsonld object as you would in JavaScript

export class ListNodeV4 {
    id!: string;
    label!: string;
    isRootNode!: boolean;
    children!: ListNodeV4[];
}

@Injectable({
    providedIn: 'root'
})
export class ListV2ApiService extends BaseApi {
    constructor(private _http: HttpClient) {
        super('v2'); // TODO weird
    }

    jsonConvert: JsonConvert = new JsonConvert(
        OperationMode.LOGGING,
        ValueCheckingMode.DISALLOW_NULL,
        false,
        PropertyMatchingRule.CASE_STRICT
    );

    getNode(nodeIri: string) {
        return this._http.get<ListNodeV2>(`${this.baseUri}/node/${encodeURIComponent(nodeIri)}`);
    }

    getList(nodeIri: string) {
        return this._http.get(`${this.baseUri}/lists/${encodeURIComponent(nodeIri)}`).pipe(
            tap(v => console.log('before', v)),
            mergeMap((response) => compact(response, {}) as unknown as Promise<ListNodeV4>),
            tap(v => console.log('after compact', v)),

            map(v => this.jsonConvert.deserialize(v, ListNodeV2) as ListNodeV2),
            tap(v => console.log('finally', v)));
    }
}
