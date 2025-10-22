/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Faro, getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import { v5 as uuidv5 } from 'uuid';
import { AppConfigService } from '@dasch-swiss/vre/core/config';
import { AuthService, AccessTokenService } from '@dasch-swiss/vre/core/session';

@Injectable({ providedIn: 'root' })
export class GrafanaFaroService {
  private readonly _appConfig = inject(AppConfigService);
  private readonly _authService = inject(AuthService);
  private readonly _accessTokenService = inject(AccessTokenService);
  private readonly _destroyRef = inject(DestroyRef);

  private _faroInstance?: Faro;

  /**
   * Initialize Faro Web SDK with configuration from environment
   */
  setup(): void {
    const faroConfig = this._appConfig.dspInstrumentationConfig.faro;

    // Skip initialization if Faro is disabled
    if (!faroConfig.enabled) {
      return;
    }

    try {
      this._faroInstance = initializeFaro({
        url: faroConfig.collectorUrl,
        app: {
          name: faroConfig.appName,
          version: this._appConfig.dspConfig.release,
          environment: this._appConfig.dspInstrumentationConfig.environment,
        },
        instrumentations: [
          ...getWebInstrumentations({
            captureConsole: faroConfig.console.enabled,
            captureConsoleDisabledLevels: faroConfig.console.disabledLevels as any,
          }),
          // Optional tracing instrumentation (increases bundle size)
          new TracingInstrumentation(),
        ],
        sessionTracking: faroConfig.sessionTracking,
      });

      this._setupUserTracking();
    } catch (error) {
      // Fail silently - don't break the app if Faro fails to initialize
      console.error('Faro initialization failed:', error);
    }
  }

  /**
   * Track custom events for business metrics
   * @param name Event name (e.g., 'resource.created', 'search.performed')
   * @param attributes Optional attributes to attach to the event
   */
  trackEvent(name: string, attributes?: Record<string, string>): void {
    if (!this._faroInstance) {
      return;
    }

    try {
      this._faroInstance.api.pushEvent(name, attributes, 'custom');
    } catch (error) {
      console.error('Faro trackEvent failed:', error);
    }
  }

  /**
   * Track errors for monitoring
   * @param error The error to track
   * @param context Optional context information
   */
  trackError(error: Error, context?: Record<string, string>): void {
    if (!this._faroInstance) {
      return;
    }

    try {
      this._faroInstance.api.pushError(error, { context });
    } catch (faroError) {
      console.error('Faro trackError failed:', faroError);
    }
  }

  /**
   * Set up user tracking based on authentication state
   * Uses hashed user IDs to protect privacy
   */
  private _setupUserTracking(): void {
    this._authService
      .isCredentialsValid$()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(isValid => {
        if (!isValid) {
          this._removeUser();
          return;
        }

        const userIri = this._accessTokenService.getTokenUser();
        if (userIri) {
          this._setUser(userIri);
        }
      });
  }

  /**
   * Set user ID in Faro (hashed for privacy)
   * @param userIri The user IRI from the JWT token
   */
  private _setUser(userIri: string): void {
    if (!this._faroInstance) {
      return;
    }

    try {
      // Hash the user IRI using UUID v5 with URL namespace
      const hashedUserId = uuidv5(userIri, uuidv5.URL);
      this._faroInstance.api.setUser({
        id: hashedUserId,
      });
    } catch (error) {
      console.error('Faro setUser failed:', error);
    }
  }

  /**
   * Remove user ID from Faro (on logout)
   */
  private _removeUser(): void {
    if (!this._faroInstance) {
      return;
    }

    try {
      this._faroInstance.api.setUser({
        id: undefined,
      });
    } catch (error) {
      console.error('Faro removeUser failed:', error);
    }
  }
}
