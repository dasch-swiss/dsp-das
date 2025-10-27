import { TestBed } from '@angular/core/testing';
import { ApiResponseError, KnoraApiConnection, LoginResponse, ReadUser } from '@dasch-swiss/dsp-js';
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
    it('should return true when credentials are valid', () => {
      // TODO: implement test
    });

    it('should return false when credentials check fails', () => {
      // TODO: implement test
    });
  });

  describe('afterSuccessfulLogin$()', () => {
    it('should load user and set language preferences', () => {
      // TODO: implement test
    });

    it('should propagate user service errors', () => {
      // TODO: implement test
    });
  });

  describe('login$()', () => {
    it('should identify email vs username by @ presence', () => {
      // TODO: implement test
    });

    it('should authenticate via DSP API with correct credentials', () => {
      // TODO: implement test
    });

    it('should store token and update JWT connection', () => {
      // TODO: implement test
    });

    it('should complete authentication via afterSuccessfulLogin$', () => {
      // TODO: implement test
    });

    it('should throw UserFeedbackError for 400/401 errors', () => {
      // TODO: implement test
    });

    it('should propagate non-authentication errors', () => {
      // TODO: implement test
    });
  });

  describe('afterLogout()', () => {
    it('should always clear user state and remove tokens', () => {
      // TODO: implement test
    });

    it('should respect clearJwt option (default: true)', () => {
      // TODO: implement test
    });

    it('should respect reloadPage option (default: false)', () => {
      // TODO: implement test
    });
  });

  describe('logout()', () => {
    it('should call API logout then execute afterLogout with full cleanup', () => {
      // TODO: implement test
    });
  });
});
