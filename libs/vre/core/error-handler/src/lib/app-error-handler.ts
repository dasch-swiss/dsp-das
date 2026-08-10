import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable, NgZone } from '@angular/core';
import { ApiResponseError } from '@dasch-swiss/dsp-js';
import { AppConfigService } from '@dasch-swiss/vre/core/config';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateService } from '@ngx-translate/core';
import { AjaxError } from 'rxjs/ajax';
import { declaredMessageOf, reasonFromErrorBody } from './api-error-reason';
import { ErrorReportingService } from './error-reporting.service';
import { UserFeedbackError } from './user-feedback-error';

@Injectable({
  providedIn: 'root',
})
export class AppErrorHandler implements ErrorHandler {
  private readonly _translateService = inject(TranslateService);

  constructor(
    private readonly _notification: NotificationService,
    private readonly _appConfig: AppConfigService,
    private readonly _ngZone: NgZone,
    private readonly _errorReporting: ErrorReportingService
  ) {}

  badRequestRegexMatch = /dsp\.errors\.BadRequestException:(.*)$/;

  /** dsp-api appends what was actually wrong with an invalid request in a trailing parenthesis. */
  invalidRequestDetailMatch = /\((.*)\)$/;

  handleError(error: any): void {
    // Reported before branching, so every branch reaches telemetry rather than only the last one.
    // The snackbar branches used to report nothing at all, which left every dsp-api failure — a
    // triplestore timeout, a 500, a 403 — with no trace beyond five seconds on screen (DEV-6872).
    //
    // Guarded, because telemetry is the auxiliary half of this method and the snackbar is the half
    // the user depends on. When the reporting call threw — a mis-wired dependency did exactly that —
    // it took every error message in the app down with it, and the components that call this handler
    // inline lost their failure state too. A broken reporting path must cost telemetry, nothing else.
    try {
      this._errorReporting.report(error);
    } catch (reportingError) {
      console.error('Failed to report error to telemetry:', reportingError);
    }

    if (error instanceof ApiResponseError && error.error instanceof AjaxError) {
      // JS-LIB
      this.handleGenericError(error.error, error.url);
    } else if (error instanceof HttpErrorResponse) {
      // ApiServices
      this.handleHttpErrorResponse(error);
    } else if (error instanceof UserFeedbackError) {
      this.displayNotification(error.message);
    } else if (this._appConfig.dspInstrumentationConfig.environment !== 'prod') {
      console.error(error);
    }
  }

  private handleHttpErrorResponse(error: HttpErrorResponse) {
    if (error.status === 400) {
      this.handleBadRequest(error.error);
      return;
    }

    this.handleGenericError(error, error.url);
  }

  /**
   * A 400 names the constraint the user broke, so the body is the message. It is read through the
   * shared precedence (`knora-api:error` → `message` → `error` → bare string) rather than a branch per
   * shape: branching that way recognised three of dsp-api's four and silently dropped the JSON-LD
   * `{ 'knora-api:error': … }` the hand-written v2 services answer with, so that failure reached
   * Sentry while the user saw no snackbar at all (DEV-6922).
   *
   * Nothing is shown when the body carries no reason — Angular leaves `error` null for a 400 with an
   * empty body, as a gateway or proxy answers (DEV-6872) — and there is deliberately no generic
   * fallback: a 400 with nothing in it can say nothing the failed action has not already said.
   */
  private handleBadRequest(body: unknown): void {
    const reason = reasonFromErrorBody(body);

    if (reason === undefined) {
      return;
    }

    // A declared `{ message }` is dsp-api's own sentence for the user and is shown whole; tidying it
    // would swap a full explanation for whatever its last clause happens to be. The other fields
    // carry raw exception text, which is worth tidying.
    const isDeclaredMessage = declaredMessageOf(body) === reason;
    this.displayNotification(isDeclaredMessage ? reason : this.readableExceptionText(reason));
  }

  /**
   * The part of dsp-api's exception text worth putting on screen: the detail it appends in a trailing
   * parenthesis, else whatever follows the exception class, else the text as it stands.
   *
   * The order matters and preserves what the user used to end up seeing. Both extractions ran, one
   * after the other, and `MatSnackBar.open` replaces the bar already showing — so the parenthesised
   * detail won whenever there was one, and the message following the class name is only reached
   * without it.
   *
   * TODO ask the backend to uniformize their response, so that none of this is needed.
   */
  private readableExceptionText(reason: string): string {
    return reason.match(this.invalidRequestDetailMatch)?.[1] ?? reason.match(this.badRequestRegexMatch)?.[1] ?? reason;
  }

  private handleGenericError(error: HttpErrorResponse | AjaxError, url: string | null): void {
    let message: string;

    if (error.status === 0) {
      message = this._translateService.instant('core.errorHandler.noInternet');
    } else if (error.message.includes('knora.json: 0 Unknown Error')) {
      message = this._translateService.instant('core.errorHandler.iiifServerError');
    } else if (error.status === 400) {
      // A 400 carries an actionable reason. Support both response shapes: the older JSON-LD
      // `knora-api:error` ("dsp.errors.BadRequestException: <msg>") and the newer `{ message }`.
      // Use a null-safe match (a present-but-non-matching string must not throw on `.length`).
      const response = (error as AjaxError).response as { 'knora-api:error'?: string; message?: string } | undefined;
      const knoraError = response?.['knora-api:error'];
      const knoraErrorMatch = typeof knoraError === 'string' ? knoraError.match(this.badRequestRegexMatch) : null;
      message =
        knoraErrorMatch?.[1] ??
        response?.message ??
        knoraError ??
        this._translateService.instant('core.errorHandler.contactSupport');
    } else if (error.status === 403) {
      message = this._translateService.instant('core.errorHandler.noPermission');
    } else if (error.status === 404) {
      message = this._translateService.instant('core.errorHandler.notFound');
    } else if (error.status === 409) {
      // Only the JS-LIB `AjaxError` carries `response`. A 409 from the generated OpenAPI client
      // arrives as an `HttpErrorResponse`, which keeps its body on `error` and has no `response` at
      // all — so reading straight through it threw inside the error handler, and a handler that
      // throws costs the user every snackbar (DEV-6872). Every OpenAPI-declared 409 answers with a
      // `{ message }` ConflictException, so reading only `knora-api:error` would swap the server's
      // explanation for "contact support" on exactly the path that used to throw.
      const body = (error as AjaxError).response ?? (error as HttpErrorResponse).error;
      message = reasonFromErrorBody(body) ?? this._translateService.instant('core.errorHandler.contactSupport');
    } else if (error.status === 504) {
      message = this._translateService.instant('core.errorHandler.timeout', { url });
    } else {
      message = this._translateService.instant('core.errorHandler.contactSupport');
    }

    this.displayNotification(message);
  }

  private displayNotification(message: string) {
    // ngZone is needed, as ErrorHandler does not invoke change detection cycle.
    this._ngZone.run(() => {
      this._notification.openSnackBar(message, 'error');
    });
  }
}
