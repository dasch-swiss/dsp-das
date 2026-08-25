import { ErrorHandler, Provider } from '@angular/core';
import { AppErrorHandler } from './app-error-handler';

/**
 * Binds Angular's `ErrorHandler` token to {@link AppErrorHandler}.
 *
 * Deliberately carries no `deps` array. Angular's `providerToFactory` bypasses a class's own factory
 * whenever a `useClass` provider declares `deps`, and constructs it from that list instead — so a
 * hand-written list silently passes `undefined` for every constructor parameter added after it was
 * last edited. That is what happened when `ErrorReportingService` joined the constructor: the handler
 * threw on its own first line, so no error reached a snackbar or telemetry at all (DEV-6872 QA bounce).
 * Unit tests could not see it, because they resolve the class token directly rather than through this
 * binding. `useExisting` also keeps a single instance shared with the `providedIn: 'root'` one.
 */
export function provideAppErrorHandler(): Provider[] {
  return [{ provide: ErrorHandler, useExisting: AppErrorHandler }];
}
