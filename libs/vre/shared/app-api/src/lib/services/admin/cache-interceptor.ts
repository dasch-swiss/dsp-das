import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(private cache: CacheService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // continue if not cacheable.
    if (!this.isCacheable(req)) {
      return next.handle(req);
    }

    const cachedResponse = this.cache.get(req.url);
    return cachedResponse ? of(cachedResponse) : this.sendRequest(req, next);
  }

  isCacheable(req: HttpRequest<any>) {
    return req.method === 'GET' && req.url.startsWith('http://0.0.0.0:3333/admin');
  }

  sendRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        // There may be other events besides the response.
        if (event instanceof HttpResponse) {
          this.cache.put(req.url, event); // Update the cache.
        }
      })
    );
  }
}
