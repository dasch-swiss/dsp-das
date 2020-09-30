import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs/internal/observable/throwError';


export class HttpError{
    static BadRequest = 400;
    static Unauthorized = 401;
    static Forbidden = 403;
    static NotFound = 404;
    static TimeOut = 408;
    static Conflict = 409;
    static InternalServerError = 500;
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

//   constructor() {}

//   intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
//     return next.handle(request);
//   }


  constructor(private _injector: Injector) {}

intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const logFormat = 'background: maroon; color: white';

    return next.handle(request).pipe(
        retry(2),
        catchError((error: HttpErrorResponse) => {

            // server side error message: Internal server error or Service unavailable
            if (error.status >= 500 && error.status < 600) {
                window.location.reload();
            }


            console.warn('response error', error)
          if (error.status !== 401) {
            // 401 handled in auth.interceptor
            // this.toastr.error(error.message);
          }
          return throwError(error);
        })
      );


    next.handle(request).subscribe(
        (event) => {
            console.log('event', event)
        }, exception => {
            console.log('exception', exception)
            if (exception instanceof HttpErrorResponse) {
            }
        }
    )

    return;
    // return next.handle(req)
    //     .do(event => {
    //     }, exception => {
    //         if (exception instanceof HttpErrorResponse) {
    //             switch (exception.status) {

    //                 case HttpError.BadRequest:
    //                     console.error('%c Bad Request 400', logFormat);
    //                     break;

    //                 case HttpError.Unauthorized:
    //                     console.error('%c Unauthorized 401', logFormat);
    //                     window.location.href = '/login' + window.location.hash;
    //                     break;

    //                 case HttpError.NotFound:
    //                     //show error toast message
    //                     console.error('%c Not Found 404', logFormat);
    //                     const _toaster = this._injector.get(Toaster),
    //                         _router = this._injector.get(Router);
    //                     _toaster.show({
    //                         message: exception.error && exception.error.message ? exception.error.message :
    //                             exception.statusText,
    //                         typeId: 'error',
    //                         isDismissable: true
    //                     });
    //                     _router.navigate(['']);
    //                     break;

    //                 case HttpError.TimeOut:
    //                     // Handled in AnalyticsExceptionHandler
    //                     console.error('%c TimeOut 408', logFormat);
    //                     break;

    //                 case HttpError.Forbidden:
    //                     console.error('%c Forbidden 403', logFormat);
    //                     const _authService = this._injector.get(AuthorizationService);
    //                     _authService.showForbiddenModal();
    //                     break;

    //                 case HttpError.InternalServerError:
    //                     console.error('%c big bad 500', logFormat);
    //                     break;
    //             }
    //         }
    //     });

    }
}
