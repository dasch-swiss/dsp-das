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
    console.log('interceptor', req.url);
    if (!this.isCacheable(req)) {
      return next.handle(req);
    }
    console.log('check isCacheable', req);

    const cachedResponse = this.cache.get(req.url);
    console.log('cached response', this.cache, cachedResponse);
    return cachedResponse ? of(cachedResponse).pipe(tap(v => console.log('debug', v))) : this.sendRequest(req, next);
  }

  isCacheable(req: HttpRequest<any>) {
    return req.method === 'GET' && req.url.startsWith('http://0.0.0.0:3333/admin');
  }

  sendRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        // There may be other events besides the response.
        if (event instanceof HttpResponse) {
          console.log('received', event);
          this.cache.put(req.url, event.body); // Update the cache.
        }
      })
    );
  }
}
