import { Injectable } from '@angular/core';
import { HttpRefresher } from './http-refresher.service';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  _cache = new Map<string, any>();

  constructor(private _httpRefresher: HttpRefresher) {
    this._httpRefresher.get('PROJECT').subscribe(() => {
      this._cache.clear();
    });
  }
  get(url: string): any | undefined {
    return this._cache.get(url);
  }
  put(url: string, data: any): void {
    this._cache.set(url, data);
  }

  has(url: string) {
    return this._cache.has(url);
  }
}
