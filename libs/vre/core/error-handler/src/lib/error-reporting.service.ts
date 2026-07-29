/// <reference types="window" />

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponseError } from '@dasch-swiss/dsp-js';

/**
 * How long the same fingerprint stays suppressed after being reported, per browser tab.
 *
 * A triplestore timeout (DEV-6864) fails for every user at once, and a user who keeps hitting retry
 * multiplies that again. Collapsing repeats of an *identical* failure inside a short window keeps one
 * incident from burning the Sentry quota; every distinct failure still gets through.
 */
const DEDUP_WINDOW_MS = 60_000;

/** `HttpErrorResponse` carries no request method, and dsp-js leaves it empty when the xhr had none. */
const UNKNOWN_METHOD = 'UNKNOWN';

const UNKNOWN_ROUTE = 'unknown';

/** The request-shaped fields shared by the types a dsp-api failure can arrive as. */
interface ApiFailure {
  status: number;
  method: string;
  url: string;
}

interface ReportPayload {
  /**
   * What Sentry captures. An `Error` wherever one exists, otherwise the raw value, so Sentry keeps
   * applying its own serialization to whatever was thrown.
   */
  sentryError: unknown;
  /** Faro's `pushError` accepts only `Error | string`. */
  faroError: Error | string;
  /** Set for API failures only — see `_buildPayload`. */
  fingerprint?: string[];
  tags: Record<string, string>;
  /**
   * Unindexed event detail. The request URL goes here rather than into a tag: a Gravsearch query runs
   * to thousands of characters, well past Sentry's 200-character tag limit, and every one is unique.
   */
  extra?: Record<string, string>;
}

/**
 * Reports errors to telemetry (Sentry, Faro) **without** notifying the user.
 *
 * This is the half of error handling that `AppErrorHandler` used to fuse with the snackbar: anything
 * that got a snackbar got no telemetry, and vice versa, so no `ApiResponseError` or
 * `HttpErrorResponse` had ever reached Sentry (DEV-6872). Degraded paths that deliberately stay
 * silent towards the user — a failed count query next to a rendered result list — call this directly.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorReportingService {
  private readonly _reportedAt = new Map<string, number>();

  /**
   * @param error the caught value, in any shape.
   * @param context low-cardinality key/value pairs attached as Sentry tags — a component and
   * operation name, so a silent failure can be traced back to the call site that swallowed it.
   */
  report(error: unknown, context?: Record<string, string>): void {
    const payload = this._buildPayload(error, context);

    if (payload.fingerprint && this._isSuppressed(payload.fingerprint)) {
      return;
    }

    this._sendToSentry(payload);
    this._sendToFaro(payload);
  }

  private _buildPayload(error: unknown, context?: Record<string, string>): ReportPayload {
    const failure = ErrorReportingService._asApiFailure(error);

    if (!failure) {
      return {
        sentryError: error,
        faroError: error instanceof Error ? error : String(error),
        tags: { ...context },
      };
    }

    const route = ErrorReportingService._routeOf(failure.url);
    const status = `${failure.status}`;
    // Neither ApiResponseError nor HttpErrorResponse extends Error, so Sentry would file every one of
    // them as "Non-Error exception captured with keys: …" and Faro would reject them outright.
    // Re-express the failure as a real Error whose message is the part worth grouping on.
    const reported = new Error(`dsp-api ${status} ${failure.method} ${route}`);
    reported.name = 'DspApiError';

    return {
      sentryError: reported,
      faroError: reported,
      // Without a stack trace Sentry groups by message, and dsp-api puts resource IRIs and whole
      // Gravsearch queries in the URL — left alone that is one issue per request. Group on the coarse
      // route instead; the full URL stays on the event.
      fingerprint: ['dsp-api', failure.method, status, route],
      tags: {
        'dsp.status': status,
        'dsp.method': failure.method,
        'dsp.route': route,
        ...context,
      },
      extra: { 'dsp.url': failure.url },
    };
  }

  private static _asApiFailure(error: unknown): ApiFailure | null {
    if (error instanceof ApiResponseError) {
      // ApiResponseError copies status/method/url off the AjaxError it wraps, so its own fields are
      // enough here; the wrapped error only adds the response body.
      return {
        status: error.status,
        method: error.method || UNKNOWN_METHOD,
        url: error.url,
      };
    }

    if (error instanceof HttpErrorResponse) {
      return {
        status: error.status,
        method: UNKNOWN_METHOD,
        url: error.url ?? '',
      };
    }

    return null;
  }

  /**
   * Collapses a request URL to a coarse route, so that "same endpoint, same status" is one Sentry
   * issue. Everything past the second path segment is dropped because that is where dsp-api puts
   * search terms, IRIs and Gravsearch queries. A `/count` segment survives: a failing count query is
   * a distinct — and far more expensive — operation than the paged query beside it (DEV-6809).
   */
  private static _routeOf(url: string): string {
    if (!url) {
      return UNKNOWN_ROUTE;
    }

    const path = url.split('?')[0].replace(/^[a-z][a-z\d+.-]*:\/\/[^/]+/i, '');
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) {
      return '/';
    }

    const head = segments.slice(0, 2);
    const route = `/${head.join('/')}`;

    return segments.includes('count') && !head.includes('count') ? `${route}/count` : route;
  }

  private _isSuppressed(fingerprint: string[]): boolean {
    const key = fingerprint.join('|');
    const now = Date.now();
    const previous = this._reportedAt.get(key);

    if (previous !== undefined && now - previous < DEDUP_WINDOW_MS) {
      return true;
    }

    this._reportedAt.set(key, now);
    return false;
  }

  /**
   * Sentry is lazy loaded by main.ts and only in the environments that are not excluded there, so its
   * absence is the normal case locally and on the dev servers.
   */
  private _sendToSentry(payload: ReportPayload): void {
    try {
      if (window.Sentry && typeof window.Sentry.captureException === 'function') {
        window.Sentry.captureException(payload.sentryError, {
          tags: payload.tags,
          extra: payload.extra,
          fingerprint: payload.fingerprint,
        });
      }
    } catch (sentryError) {
      console.error('Failed to send error to Sentry:', sentryError);
    }
  }

  /** Faro is lazy loaded by GrafanaFaroService, and currently disabled in every environment. */
  private _sendToFaro(payload: ReportPayload): void {
    try {
      if (window.__FARO__ && typeof window.__FARO__.api?.pushError === 'function') {
        window.__FARO__.api.pushError(payload.faroError, { context: payload.tags });
      }
    } catch (faroError) {
      console.error('Failed to send error to Faro:', faroError);
    }
  }
}
