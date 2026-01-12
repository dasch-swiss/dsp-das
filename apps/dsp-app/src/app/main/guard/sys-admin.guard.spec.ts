import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { AutoLoginService, UserService } from '@dasch-swiss/vre/core/session';
import { BehaviorSubject } from 'rxjs';
import { SysAdminGuard } from './sys-admin.guard';

describe('SysAdminGuard', () => {
  let guard: SysAdminGuard;
  let autoLoginServiceMock: Partial<AutoLoginService>;
  let userServiceMock: Partial<UserService>;
  let routerMock: jest.Mocked<Partial<Router>>;
  let hasCheckedCredentialsSubject: BehaviorSubject<boolean>;
  let isSysAdminSubject: BehaviorSubject<boolean>;

  beforeEach(() => {
    hasCheckedCredentialsSubject = new BehaviorSubject<boolean>(false);
    isSysAdminSubject = new BehaviorSubject<boolean>(false);

    autoLoginServiceMock = {
      hasCheckedCredentials$: hasCheckedCredentialsSubject,
    };

    userServiceMock = {
      isSysAdmin$: isSysAdminSubject,
    };

    routerMock = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        SysAdminGuard,
        { provide: AutoLoginService, useValue: autoLoginServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    guard = TestBed.inject(SysAdminGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is sys admin', done => {
      hasCheckedCredentialsSubject.next(true);
      isSysAdminSubject.next(true);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(true);
        expect(routerMock.navigate).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return false and navigate to home when user is not sys admin', done => {
      hasCheckedCredentialsSubject.next(true);
      isSysAdminSubject.next(false);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith([RouteConstants.home]);
        done();
      });
    });

    it('should wait for credentials to be checked before proceeding', done => {
      // Initially credentials not checked
      hasCheckedCredentialsSubject.next(false);
      isSysAdminSubject.next(true);

      let emitted = false;

      guard.canActivate().subscribe(() => {
        emitted = true;
        expect(hasCheckedCredentialsSubject.value).toBe(true);
        done();
      });

      // Should not emit yet
      setTimeout(() => {
        expect(emitted).toBe(false);

        // Now mark credentials as checked
        hasCheckedCredentialsSubject.next(true);
      }, 10);
    });

    it('should not emit when credentials have not been checked', done => {
      // Start with credentials not checked
      hasCheckedCredentialsSubject.next(false);
      isSysAdminSubject.next(true);

      let emitted = false;

      guard.canActivate().subscribe(() => {
        emitted = true;
      });

      setTimeout(() => {
        expect(emitted).toBe(false);
        done();
      }, 50);
    });
  });
});
