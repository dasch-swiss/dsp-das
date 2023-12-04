import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApi } from './base-api';
import { CredentialsResponse, LoginResponse } from '@dasch-swiss/dsp-js';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationApiService extends BaseApi {
    constructor(private _http: HttpClient) {
        super('authentication');
    }

    checkCredentials() {
        return this._http.get<CredentialsResponse>('');
    }

    login(property: 'iri' | 'email' | 'username', id: string, password: string) {
        const credentials: any = {
            password
        };
        credentials[property] = id;

        return this._http.post<LoginResponse>('', credentials);
    }

    logout() {
        return this._http.delete('');
    }
}
