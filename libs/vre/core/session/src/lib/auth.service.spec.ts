import { TestBed } from '@angular/core/testing';
import { ApiResponseError, KnoraApiConnection, ReadUser } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { UserFeedbackError } from '@dasch-swiss/vre/core/error-handler';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AccessTokenService } from './access-token.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: jest.Mocked<Partial<UserService>>;
  let mockTranslateService: jest.Mocked<Partial<TranslateService>>;
  let mockAccessTokenService: jest.Mocked<Partial<AccessTokenService>>;
  let mockDspApiConnection: jest.Mocked<Partial<KnoraApiConnection>>;
  let mockLocalizationService: jest.Mocked<Partial<LocalizationService>>;

  const mockUser: ReadUser = {
    id: 'http://rdf.dasch.swiss/users/test-user',
    username: 'testuser',
    email: 'test@example.com',
    givenName: 'Test',
    familyName: 'User',
    status: true,
    lang: 'en',
    password: '',
    projects: [],
    groups: [],
    permissions: {
      groupsPerProject: {},
    },
  } as ReadUser;

  beforeEach(() => {
    mockUserService = {
      loadUser: jest.fn(),
      logout: jest.fn(),
    };

    mockTranslateService = {
      instant: jest.fn(),
    };

    mockAccessTokenService = {
      storeToken: jest.fn(),
      removeTokens: jest.fn(),
      getAccessToken: jest.fn(),
      decodedAccessToken: jest.fn(),
    };

    mockDspApiConnection = {
      v2: {
        auth: {
          checkCredentials: jest.fn(),
          login: jest.fn(),
          logout: jest.fn(),
        },
        jsonWebToken: '',
      },
    } as any;

    mockLocalizationService = {
      setLanguage: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: AccessTokenService, useValue: mockAccessTokenService },
        { provide: DspApiConnectionToken, useValue: mockDspApiConnection },
        { provide: LocalizationService, useValue: mockLocalizationService },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('isCredentialsValid$()', () => {
    it('should return true when credentials are valid', done => {
      mockDspApiConnection.v2!.auth!.checkCredentials = jest.fn().mockReturnValue(of({}));

      service.isCredentialsValid$().subscribe(result => {
        expect(result).toBe(true);
        expect(mockDspApiConnection.v2!.auth!.checkCredentials).toHaveBeenCalled();
        done();
      });
    });

    it('should return false when credentials check fails', done => {
      mockDspApiConnection.v2!.auth!.checkCredentials = jest
        .fn()
        .mockReturnValue(throwError(() => new Error('Invalid credentials')));

      service.isCredentialsValid$().subscribe(result => {
        expect(result).toBe(false);
        done();
      });
    });
  });

  describe('afterSuccessfulLogin$()', () => {
    it('should load user and set language preferences', done => {
      mockUserService.loadUser = jest.fn().mockReturnValue(of(mockUser));

      service.afterSuccessfulLogin$('test@example.com', 'email').subscribe(user => {
        expect(mockUserService.loadUser).toHaveBeenCalledWith('test@example.com', 'email');
        expect(mockLocalizationService.setLanguage).toHaveBeenCalledWith('en');
        expect(user).toEqual(mockUser);
        done();
      });
    });

    it('should propagate user service errors', done => {
      const error = new Error('User load failed');
      mockUserService.loadUser = jest.fn().mockReturnValue(throwError(() => error));

      service.afterSuccessfulLogin$('testuser', 'username').subscribe({
        error: err => {
          expect(err).toBe(error);
          expect(mockUserService.loadUser).toHaveBeenCalledWith('testuser', 'username');
          done();
        },
      });
    });
  });

  describe('login$()', () => {
    const mockLoginResponse = {
      body: { token: 'mock-jwt-token' },
    };

    beforeEach(() => {
      mockDspApiConnection.v2!.auth!.login = jest.fn().mockReturnValue(of(mockLoginResponse));
      mockUserService.loadUser = jest.fn().mockReturnValue(of(mockUser));
    });

    it('should identify email vs username by @ presence', done => {
      // Test with email
      service.login$('test@example.com', 'password').subscribe(() => {
        expect(mockDspApiConnection.v2!.auth!.login).toHaveBeenCalledWith('email', 'test@example.com', 'password');
      });

      // Test with username
      service.login$('testuser', 'password').subscribe(() => {
        expect(mockDspApiConnection.v2!.auth!.login).toHaveBeenCalledWith('username', 'testuser', 'password');
        done();
      });
    });

    it('should authenticate via DSP API with correct credentials', done => {
      service.login$('test@example.com', 'mypassword').subscribe(() => {
        expect(mockDspApiConnection.v2!.auth!.login).toHaveBeenCalledWith('email', 'test@example.com', 'mypassword');
        done();
      });
    });

    it('should store token and update JWT connection', done => {
      service.login$('test@example.com', 'password').subscribe(() => {
        expect(mockAccessTokenService.storeToken).toHaveBeenCalledWith('mock-jwt-token');
        expect(mockDspApiConnection.v2!.jsonWebToken).toBe('mock-jwt-token');
        done();
      });
    });

    it('should complete authentication via afterSuccessfulLogin$', done => {
      const afterSuccessfulLoginSpy = jest.spyOn(service, 'afterSuccessfulLogin$');

      service.login$('test@example.com', 'password').subscribe(() => {
        expect(afterSuccessfulLoginSpy).toHaveBeenCalledWith('test@example.com', 'email');
        done();
      });
    });

    it('should throw UserFeedbackError for 400/401 errors', done => {
      const apiError = Object.create(ApiResponseError.prototype);
      apiError.status = 400;
      apiError.message = 'Bad Request';

      mockDspApiConnection.v2!.auth!.login = jest.fn().mockReturnValue(throwError(() => apiError));
      mockTranslateService.instant = jest.fn().mockReturnValue('Invalid credentials');

      service.login$('test@example.com', 'wrongpassword').subscribe({
        error: err => {
          expect(err).toBeInstanceOf(UserFeedbackError);
          expect(err.message).toBe('Invalid credentials');
          expect(mockTranslateService.instant).toHaveBeenCalledWith('core.auth.invalidCredentials');
          done();
        },
      });
    });

    it('should propagate non-authentication errors', done => {
      const networkError = new Error('Network error');
      mockDspApiConnection.v2!.auth!.login = jest.fn().mockReturnValue(throwError(() => networkError));

      service.login$('test@example.com', 'password').subscribe({
        error: err => {
          expect(err).toBe(networkError);
          expect(err.message).toBe('Network error');
          done();
        },
      });
    });
  });

  describe('afterLogout()', () => {
    it('should always clear user state and remove tokens', () => {
      service.afterLogout();

      expect(mockUserService.logout).toHaveBeenCalled();
      expect(mockAccessTokenService.removeTokens).toHaveBeenCalled();
    });

    it('should respect clearJwt option (default: true)', () => {
      // Test with default (should clear JWT)
      mockDspApiConnection.v2!.jsonWebToken = 'some-token';
      service.afterLogout();
      expect(mockDspApiConnection.v2!.jsonWebToken).toBe('');

      // Test with clearJwt: true
      mockDspApiConnection.v2!.jsonWebToken = 'some-token';
      service.afterLogout({ clearJwt: true });
      expect(mockDspApiConnection.v2!.jsonWebToken).toBe('');

      // Test with clearJwt: false
      mockDspApiConnection.v2!.jsonWebToken = 'some-token';
      service.afterLogout({ clearJwt: false });
      expect(mockDspApiConnection.v2!.jsonWebToken).toBe('some-token');
    });

    it('should respect reloadPage option (default: false)', () => {
      // Spy on window.location.reload
      const originalLocation = window.location;
      const reloadMock = jest.fn();

      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...originalLocation, reload: reloadMock },
      });

      // Test with default (should not reload)
      service.afterLogout();
      expect(reloadMock).not.toHaveBeenCalled();

      // Reset mock
      reloadMock.mockClear();

      // Test with reloadPage: false
      service.afterLogout({ reloadPage: false });
      expect(reloadMock).not.toHaveBeenCalled();

      // Reset mock
      reloadMock.mockClear();

      // Test with reloadPage: true
      service.afterLogout({ reloadPage: true });
      expect(reloadMock).toHaveBeenCalled();

      // Restore
      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation,
      });
    });
  });

  describe('logout()', () => {
    it('should call API logout then execute afterLogout with full cleanup', () => {
      // Spy on window.location.reload
      const originalLocation = window.location;
      const reloadMock = jest.fn();

      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...originalLocation, reload: reloadMock },
      });

      mockDspApiConnection.v2!.auth!.logout = jest.fn().mockReturnValue(of({}));
      const afterLogoutSpy = jest.spyOn(service, 'afterLogout');

      service.logout();

      expect(mockDspApiConnection.v2!.auth!.logout).toHaveBeenCalled();
      expect(afterLogoutSpy).toHaveBeenCalledWith({ clearJwt: true, reloadPage: true });
      expect(reloadMock).toHaveBeenCalled();

      // Restore
      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation,
      });
    });
  });
});
