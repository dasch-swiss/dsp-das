/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '@dasch-swiss/vre/core/config';
import { AuthService, AccessTokenService } from '@dasch-swiss/vre/core/session';
import { of } from 'rxjs';
import { GrafanaFaroService } from './grafana-faro.service';

// Mock Faro SDK
jest.mock('@grafana/faro-web-sdk', () => ({
  initializeFaro: jest.fn(() => ({
    api: {
      pushEvent: jest.fn(),
      pushError: jest.fn(),
      setUser: jest.fn(),
    },
  })),
  getWebInstrumentations: jest.fn(() => []),
}));

jest.mock('@grafana/faro-web-tracing', () => ({
  TracingInstrumentation: jest.fn(),
}));

describe('GrafanaFaroService', () => {
  let service: GrafanaFaroService;
  let mockAppConfigService: jest.Mocked<AppConfigService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockAccessTokenService: jest.Mocked<AccessTokenService>;

  beforeEach(() => {
    // Create mock services
    mockAppConfigService = {
      dspInstrumentationConfig: {
        environment: 'test',
        faro: {
          enabled: true,
          collectorUrl: 'http://localhost:12345/collect',
          appName: 'dsp-app-test',
          sessionTracking: {
            enabled: true,
            persistent: true,
            samplingRate: 1.0,
          },
          console: {
            enabled: true,
            disabledLevels: [],
          },
        },
      },
      dspConfig: {
        release: '1.0.0-test',
      },
    } as any;

    mockAuthService = {
      isCredentialsValid$: jest.fn(() => of(false)),
    } as any;

    mockAccessTokenService = {
      getTokenUser: jest.fn(() => null),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        GrafanaFaroService,
        { provide: AppConfigService, useValue: mockAppConfigService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AccessTokenService, useValue: mockAccessTokenService },
      ],
    });

    service = TestBed.inject(GrafanaFaroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setup', () => {
    it('should not initialize when Faro is disabled', () => {
      mockAppConfigService.dspInstrumentationConfig.faro.enabled = false;
      service.setup();
      // Should not throw and should complete silently
      expect(service).toBeTruthy();
    });

    it('should initialize when Faro is enabled', () => {
      const { initializeFaro } = require('@grafana/faro-web-sdk');
      service.setup();
      expect(initializeFaro).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'http://localhost:12345/collect',
          app: expect.objectContaining({
            name: 'dsp-app-test',
            version: '1.0.0-test',
            environment: 'test',
          }),
        })
      );
    });

    it('should handle initialization errors gracefully', () => {
      const { initializeFaro } = require('@grafana/faro-web-sdk');
      initializeFaro.mockImplementationOnce(() => {
        throw new Error('Initialization failed');
      });

      // Should not throw
      expect(() => service.setup()).not.toThrow();
    });
  });

  describe('trackEvent', () => {
    it('should track custom events', () => {
      service.setup();
      const faroInstance = (service as any)._faroInstance;

      service.trackEvent('test.event', { foo: 'bar' });

      expect(faroInstance.api.pushEvent).toHaveBeenCalledWith('test.event', { foo: 'bar' }, 'custom');
    });

    it('should not track events when Faro is not initialized', () => {
      // Don't call setup()
      expect(() => service.trackEvent('test.event')).not.toThrow();
    });

    it('should handle tracking errors gracefully', () => {
      service.setup();
      const faroInstance = (service as any)._faroInstance;
      faroInstance.api.pushEvent.mockImplementationOnce(() => {
        throw new Error('Tracking failed');
      });

      expect(() => service.trackEvent('test.event')).not.toThrow();
    });
  });

  describe('trackError', () => {
    it('should track errors with context', () => {
      service.setup();
      const faroInstance = (service as any)._faroInstance;
      const error = new Error('Test error');
      const context = { component: 'TestComponent' };

      service.trackError(error, context);

      expect(faroInstance.api.pushError).toHaveBeenCalledWith(error, { context });
    });

    it('should not track errors when Faro is not initialized', () => {
      const error = new Error('Test error');
      expect(() => service.trackError(error)).not.toThrow();
    });

    it('should handle error tracking failures gracefully', () => {
      service.setup();
      const faroInstance = (service as any)._faroInstance;
      faroInstance.api.pushError.mockImplementationOnce(() => {
        throw new Error('Error tracking failed');
      });

      const error = new Error('Test error');
      expect(() => service.trackError(error)).not.toThrow();
    });
  });

  describe('user tracking', () => {
    it('should set user when credentials are valid', () => {
      mockAuthService.isCredentialsValid$ = jest.fn(() => of(true));
      mockAccessTokenService.getTokenUser = jest.fn(() => 'http://rdfh.ch/users/test-user');

      service.setup();
      const faroInstance = (service as any)._faroInstance;

      // User tracking happens asynchronously
      expect(faroInstance.api.setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String), // Hashed user ID
        })
      );
    });

    it('should remove user when credentials are invalid', () => {
      mockAuthService.isCredentialsValid$ = jest.fn(() => of(false));

      service.setup();
      const faroInstance = (service as any)._faroInstance;

      expect(faroInstance.api.setUser).toHaveBeenCalledWith({
        id: undefined,
      });
    });
  });
});
