import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
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
  let mockUrlTree: UrlTree;

  beforeEach(() => {
    isLoggedInSubject = new BehaviorSubject<boolean>(false);
    hasProjectAdminRightsSubject = new BehaviorSubject<boolean>(false);

    // Create a mock UrlTree
    mockUrlTree = { toString: () => '/not-allowed' } as UrlTree;

    userServiceMock = {
      isLoggedIn$: isLoggedInSubject,
    };

    projectPageServiceMock = {
      hasProjectAdminRights$: hasProjectAdminRightsSubject,
    };

    routerMock = {
      createUrlTree: jest.fn().mockReturnValue(mockUrlTree),
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
        expect(routerMock.createUrlTree).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return UrlTree immediately when user is not logged in', done => {
      isLoggedInSubject.next(false);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(routerMock.createUrlTree).toHaveBeenCalledWith([RouteConstants.notAllowed]);
        done();
      });
    });

    it('should return UrlTree when user is logged in but has no project admin rights', done => {
      isLoggedInSubject.next(true);
      hasProjectAdminRightsSubject.next(false);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(routerMock.createUrlTree).toHaveBeenCalledWith([RouteConstants.notAllowed]);
        done();
      });
    });

    it('should handle user not logged in with take(1)', done => {
      isLoggedInSubject.next(false);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(routerMock.createUrlTree).toHaveBeenCalledWith([RouteConstants.notAllowed]);
        done();
      });
    });

    it('should complete after one emission using take(1)', done => {
      isLoggedInSubject.next(true);
      hasProjectAdminRightsSubject.next(true);

      let emissionCount = 0;

      guard.canActivate().subscribe({
        next: result => {
          emissionCount++;
          expect(result).toBe(true);
        },
        complete: () => {
          expect(emissionCount).toBe(1);
          done();
        },
      });
    });
  });
});
