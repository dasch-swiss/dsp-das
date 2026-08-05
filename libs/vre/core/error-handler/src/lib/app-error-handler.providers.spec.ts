import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '@dasch-swiss/vre/core/config';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateService } from '@ngx-translate/core';
import { provideAppErrorHandler } from './app-error-handler.providers';
import { ErrorReportingService } from './error-reporting.service';

/**
 * Resolves the handler through the `ErrorHandler` token, the way the running app does — not through
 * the class token, the way `app-error-handler.spec.ts` does.
 *
 * The distinction is the whole point of this file: the QA-bounced build wired the token with a
 * hand-written `deps` list that had fallen one entry behind the constructor, so the instance behind
 * the token was missing its `ErrorReportingService` and threw on every single error, while every
 * class-token test kept passing (DEV-6872).
 */
describe('provideAppErrorHandler', () => {
  let openSnackBar: jest.Mock;
  let report: jest.Mock;

  beforeEach(() => {
    openSnackBar = jest.fn();
    report = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        ...provideAppErrorHandler(),
        { provide: NotificationService, useValue: { openSnackBar } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: AppConfigService, useValue: { dspInstrumentationConfig: { environment: 'prod' } } },
        { provide: ErrorReportingService, useValue: { report } },
      ],
    });
  });

  it('resolves a fully constructed handler that both reports and notifies', () => {
    const error = new HttpErrorResponse({ status: 500, url: 'http://api/v2/search/count/foo' });

    TestBed.inject(ErrorHandler).handleError(error);

    expect(report).toHaveBeenCalledWith(error);
    expect(openSnackBar).toHaveBeenCalledWith('core.errorHandler.contactSupport', 'error');
  });
});
