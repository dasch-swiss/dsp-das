import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { BehaviorSubject } from 'rxjs';
import { ProjectAdminGuard } from './project-admin.guard';
import { ProjectPageService } from './project-page.service';

describe('ProjectAdminGuard', () => {
  let guard: ProjectAdminGuard;
  let userServiceMock: Partial<UserService>;
  let projectPageServiceMock: Partial<ProjectPageService>;
  let routerMock: jest.Mocked<Partial<Router>>;
  let isLoggedInSubject: BehaviorSubject<boolean>;
  let hasProjectAdminRightsSubject: BehaviorSubject<boolean>;

  beforeEach(() => {
    isLoggedInSubject = new BehaviorSubject<boolean>(false);
    hasProjectAdminRightsSubject = new BehaviorSubject<boolean>(false);

    userServiceMock = {
      isLoggedIn$: isLoggedInSubject,
    };

    projectPageServiceMock = {
      hasProjectAdminRights$: hasProjectAdminRightsSubject,
    };

    routerMock = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ProjectAdminGuard,
        { provide: UserService, useValue: userServiceMock },
        { provide: ProjectPageService, useValue: projectPageServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    guard = TestBed.inject(ProjectAdminGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is logged in and has project admin rights', done => {
      isLoggedInSubject.next(true);
      hasProjectAdminRightsSubject.next(true);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(true);
        expect(routerMock.navigate).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return false and navigate to not-allowed page when user is not logged in', done => {
      isLoggedInSubject.next(false);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith([RouteConstants.notAllowed]);
        done();
      });
    });

    it('should return false and navigate to not-allowed page when user has no project admin rights', done => {
      isLoggedInSubject.next(true);
      hasProjectAdminRightsSubject.next(false);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith([RouteConstants.notAllowed]);
        done();
      });
    });

    it('should filter out false values from isLoggedIn$ before checking admin rights', done => {
      guard.canActivate().subscribe(() => {
        // Should not be called immediately
      });

      // User not logged in - should navigate
      isLoggedInSubject.next(false);

      setTimeout(() => {
        expect(routerMock.navigate).toHaveBeenCalledWith([RouteConstants.notAllowed]);
        done();
      }, 10);
    });

    it('should navigate to not-allowed page when logged in but no admin rights', done => {
      isLoggedInSubject.next(true);
      hasProjectAdminRightsSubject.next(false);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith([RouteConstants.notAllowed]);
        done();
      });
    });
  });
});
