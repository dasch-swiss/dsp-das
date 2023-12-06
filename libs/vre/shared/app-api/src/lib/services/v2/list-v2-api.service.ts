import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApi } from '../base-api';

export interface MyListNode {
    '@id': string;
    'rdfs:label': string;
    'knora-api:isRootNode': string;
    'knora-api:hasSubListNode': MyListNode[];
}

@Injectable({
    providedIn: 'root'
})
export class ListV2ApiService extends BaseApi {
    constructor(private _http: HttpClient) {
        super('v2'); // TODO weird
    }

    getNode(nodeIri: string) {
        return this._http.get<MyListNode>(`${this.baseUri}/node/${encodeURIComponent(nodeIri)}`);
    }

    getListWithInterface(nodeIri: string) {
        return this._http.get<MyListNode>(`${this.baseUri}/lists/${encodeURIComponent(nodeIri)}`);
    }
}
