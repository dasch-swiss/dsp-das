import { Injectable } from '@angular/core';
import { ReadUser, ReadProject, ReadOntology, ReadGroup, ListNodeInfo } from '@dasch-swiss/dsp-js';
import { Observable, of, Subject, throwError } from 'rxjs';

interface CacheContent {
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
    ): Observable<
        ReadUser |
        ReadUser[] |
        ReadProject |
        ReadOntology |
        ReadOntology[] |
        ReadGroup[] |
        ListNodeInfo[]
    > {
        if (this.has(key)) {
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
    set(key: string,
        value:
        ReadUser |
        ReadUser[] |
        ReadProject |
        ReadOntology |
        ReadOntology[] |
        ReadGroup[] |
        ListNodeInfo[]
        ): void {
        this._cache.set(key, { value: value });
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

}
