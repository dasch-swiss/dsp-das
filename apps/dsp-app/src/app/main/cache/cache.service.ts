import { Injectable } from '@angular/core';
import { Observable, of, Subject, throwError } from 'rxjs';

interface CacheContent {
    expiry: number;
    value: any;
}

@Injectable({
    providedIn: 'root',
})
/**
 * cache Service is an observables based in-memory cache implementation
 * Keeps track of in-flight observables and sets a default expiry for cached values
 * @export
 * @class CacheService
 */
export class CacheService {
    readonly DEFAULT_MAX_AGE: number = 5000; // 3600000ms => 1 Hour
    private _cache: Map<string, CacheContent> = new Map<string, CacheContent>();

    /**
     * gets the value from cache if the key is provided.
     */
    get(
        key: string,
    ): Observable<any> {
        if (this._hasValidCachedValue(key)) {
            // console.log(`%c Getting from cache by key: ${key}`, 'color: green');
            // console.log(`%c Cache returns:` + JSON.stringify(this.cache.get(key).value), 'color: green');
            // console.log(`%c Cache returns typeof:` + (typeof of(this.cache.get(key).value)), 'color: green');

            // returns observable
            return of(this._cache.get(key).value);
        } else {
            return throwError(
                'Requested key "' + key + '" is not available in Cache'
            );
        }
    }

    /**
     * sets the value with key in the cache
     */
    set(key: string, value: any, maxAge: number = this.DEFAULT_MAX_AGE): void {
        this._cache.set(key, { value: value, expiry: Date.now() + maxAge });
    }

    /**
     * checks if the key exists in cache
     */
    has(key: string): boolean {
        return this._cache.has(key);
    }

    /**
     * delete a cached content by key
     * @param key Key is the id of the content
     */
    del(key: string) {
        this._cache.delete(key);
    }

    /**
     * clear the whole cache
     */
    destroy() {
        sessionStorage.clear();
        this._cache.clear();
    }

    /**
     * checks if the key exists and has not expired.
     */
    private _hasValidCachedValue(key: string): boolean {
        if (this._cache.has(key)) {
            // if (this._cache.get(key).expiry < Date.now()) {
            //     this._cache.delete(key);
            //     console.log('value has expired');
            //     return false;
            // }
            return true;
        } else {
            return false;
        }
    }
}
