import { TestBed } from '@angular/core/testing';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { UserPermissions } from '@dasch-swiss/vre/shared/app-common';
import { firstValueFrom, of, throwError } from 'rxjs';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userApiServiceSpy: jest.SpyInstance;

  const mockUser: ReadUser = {
    id: 'http://rdf.dasch.swiss/users/test-user',
    username: 'testuser',
    email: 'test@example.com',
    givenName: 'Test',
    familyName: 'User',
    status: true,
    lang: 'en',
    password: '',
    projects: [
      { id: 'project1', shortname: 'proj1', status: true },
      { id: 'project2', shortname: 'proj2', status: false },
    ],
    permissions: {
      groupsPerProject: {},
    },
  } as ReadUser;

  const mockUserApiService = {
    get: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, { provide: UserApiService, useValue: mockUserApiService }],
    });
    service = TestBed.inject(UserService);
    userApiServiceSpy = jest.spyOn(mockUserApiService, 'get');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with null user', () => {
      expect(service.currentUser).toBeNull();
    });

    it('should have correct initial observable values', async () => {
      const user = await firstValueFrom(service.user$);
      expect(user).toBeNull();
    });

    it('should indicate user is not logged in initially', async () => {
      const isLoggedIn = await firstValueFrom(service.isLoggedIn$);
      expect(isLoggedIn).toBe(false);
    });

    it('should indicate user is not sys admin initially', async () => {
      const isSysAdmin = await firstValueFrom(service.isSysAdmin$);
      expect(isSysAdmin).toBe(false);
    });

    it('should return empty active projects initially', async () => {
      const projects = await firstValueFrom(service.userActiveProjects$);
      expect(projects).toEqual([]);
    });

    it('should return empty inactive projects initially', async () => {
      const projects = await firstValueFrom(service.userInactiveProjects$);
      expect(projects).toEqual([]);
    });
  });

  describe('loadUser', () => {
    it('should load user successfully with IRI', async () => {
      const userResponse = { user: mockUser };
      userApiServiceSpy.mockReturnValue(of(userResponse));

      const user = await firstValueFrom(service.loadUser(mockUser.id, 'iri'));
      expect(user).toEqual(mockUser);
      expect(service.currentUser).toEqual(mockUser);
      expect(userApiServiceSpy).toHaveBeenCalledWith(mockUser.id, 'iri');
    });

    it('should load user successfully with email', async () => {
      const userResponse = { user: mockUser };
      userApiServiceSpy.mockReturnValue(of(userResponse));

      const user = await firstValueFrom(service.loadUser('test@example.com', 'email'));
      expect(user).toEqual(mockUser);
      expect(service.currentUser).toEqual(mockUser);
      expect(userApiServiceSpy).toHaveBeenCalledWith('test@example.com', 'email');
    });

    it('should load user successfully with username', async () => {
      const userResponse = { user: mockUser };
      userApiServiceSpy.mockReturnValue(of(userResponse));

      const user = await firstValueFrom(service.loadUser('testuser', 'username'));
      expect(user).toEqual(mockUser);
      expect(service.currentUser).toEqual(mockUser);
      expect(userApiServiceSpy).toHaveBeenCalledWith('testuser', 'username');
    });

    it('should logout and throw AppError when API call fails', async () => {
      const error = new Error('API Error');
      userApiServiceSpy.mockReturnValue(throwError(() => error));

      await expect(firstValueFrom(service.loadUser(mockUser.id, 'iri'))).rejects.toThrow(AppError);
      expect(service.currentUser).toBeNull();
    });

    it('should update observables after successful load', async () => {
      const userResponse = { user: mockUser };
      userApiServiceSpy.mockReturnValue(of(userResponse));

      await firstValueFrom(service.loadUser(mockUser.id, 'iri'));
      const isLoggedIn = await firstValueFrom(service.isLoggedIn$);
      expect(isLoggedIn).toBe(true);
    });
  });

  describe('reloadUser', () => {
    it('should reload current user successfully', async () => {
      // First, set a current user
      const userResponse = { user: mockUser };
      userApiServiceSpy.mockReturnValue(of(userResponse));

      await firstValueFrom(service.loadUser(mockUser.id, 'iri'));

      // Now reload the user
      const user = await firstValueFrom(service.reloadUser());
      expect(user).toEqual(mockUser);
      expect(userApiServiceSpy).toHaveBeenCalledTimes(2);
      expect(userApiServiceSpy).toHaveBeenLastCalledWith(mockUser.id, 'iri');
    });

    it('should throw AppError when no user is logged in', () => {
      expect(() => service.reloadUser()).toThrow(AppError);
      expect(() => service.reloadUser()).toThrow('No user is currently logged in.');
    });
  });

  describe('logout', () => {
    it('should clear current user', async () => {
      // First, load a user
      const userResponse = { user: mockUser };
      userApiServiceSpy.mockReturnValue(of(userResponse));

      await firstValueFrom(service.loadUser(mockUser.id, 'iri'));
      expect(service.currentUser).toEqual(mockUser);

      // Then logout
      service.logout();
      expect(service.currentUser).toBeNull();

      const isLoggedIn = await firstValueFrom(service.isLoggedIn$);
      expect(isLoggedIn).toBe(false);
    });
  });

  describe('observables with user data', () => {
    beforeEach(async () => {
      const userResponse = { user: mockUser };
      userApiServiceSpy.mockReturnValue(of(userResponse));

      await firstValueFrom(service.loadUser(mockUser.id, 'iri'));
    });

    it('should indicate user is logged in', async () => {
      const isLoggedIn = await firstValueFrom(service.isLoggedIn$);
      expect(isLoggedIn).toBe(true);
    });

    it('should check sys admin rights correctly', async () => {
      const hasSysAdminSpy = jest.spyOn(UserPermissions, 'hasSysAdminRights').mockReturnValue(true);

      const isSysAdmin = await firstValueFrom(service.isSysAdmin$);
      expect(isSysAdmin).toBe(true);
      expect(hasSysAdminSpy).toHaveBeenCalledWith(mockUser);
    });

    it('should return active projects correctly', async () => {
      const projects = await firstValueFrom(service.userActiveProjects$);
      expect(projects).toEqual([{ id: 'project1', shortname: 'proj1', status: true }]);
    });

    it('should return inactive projects correctly', async () => {
      const projects = await firstValueFrom(service.userInactiveProjects$);
      expect(projects).toEqual([{ id: 'project2', shortname: 'proj2', status: false }]);
    });
  });

  describe('observables without user data', () => {
    it('should return false for sys admin when user is null', async () => {
      const isSysAdmin = await firstValueFrom(service.isSysAdmin$);
      expect(isSysAdmin).toBe(false);
    });

    it('should return empty array for active projects when user is null', async () => {
      const projects = await firstValueFrom(service.userActiveProjects$);
      expect(projects).toEqual([]);
    });

    it('should return empty array for inactive projects when user is null', async () => {
      const projects = await firstValueFrom(service.userInactiveProjects$);
      expect(projects).toEqual([]);
    });
  });
});
