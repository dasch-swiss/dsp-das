import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApi } from './base-api';

@Injectable({
    providedIn: 'root'
})
export class ListV2ApiService extends BaseApi {
    constructor(private _http: HttpClient) {
        super('');
    }
}
