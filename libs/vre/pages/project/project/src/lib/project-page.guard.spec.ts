/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { StoredProject } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { of, throwError } from 'rxjs';
import { ProjectPageGuard } from './project-page.guard';
import { ProjectPageService } from './project-page.service';

describe('ProjectPageGuard', () => {
  let guard: ProjectPageGuard;
  let mockProjectPageService: Partial<ProjectPageService>;
  let mockRouter: Partial<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  const mockProject: StoredProject = {
    id: 'http://rdfh.ch/projects/0001',
    shortname: 'test-project',
    shortcode: '0001',
    longname: 'Test Project',
    description: [{ language: 'en', value: 'A test project' }],
    keywords: [],
    logo: '',
    status: true,
    selfjoin: false,
  } as StoredProject;

  beforeEach(() => {
    mockProjectPageService = {
      setup: jest.fn(),
      currentProject$: of(mockProject),
    };

    mockRouter = {
      parseUrl: jest.fn().mockReturnValue({} as UrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        ProjectPageGuard,
        { provide: ProjectPageService, useValue: mockProjectPageService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    guard = TestBed.inject(ProjectPageGuard);

    // Setup mock route and state
    route = {
      params: { [RouteConstants.uuidParameter]: 'test-uuid-1234' },
    } as unknown as ActivatedRouteSnapshot;

    state = {
      url: '/project/test-uuid-1234',
    } as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should allow activation when project loads successfully', done => {
      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(true);
        expect(projectPageService.setup).toHaveBeenCalledWith('test-uuid-1234');
        done();
      });
    });

    it('should call setup with the correct project UUID from route params', done => {
      const testUuid = 'custom-uuid-5678';
      route.params[RouteConstants.uuidParameter] = testUuid;

      guard.canActivate(route, state).subscribe(() => {
        expect(projectPageService.setup).toHaveBeenCalledWith(testUuid);
        done();
      });
    });

    it('should redirect to 404 when project UUID is missing from route params', done => {
      route.params = {}; // No UUID parameter
      const mockUrlTree = {} as UrlTree;
      router.parseUrl.and.returnValue(mockUrlTree);

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(router.parseUrl).toHaveBeenCalledWith('**');
        expect(projectPageService.setup).not.toHaveBeenCalled();
        done();
      });
    });

    it('should redirect to 404 when project UUID is undefined', done => {
      route.params[RouteConstants.uuidParameter] = undefined;
      const mockUrlTree = {} as UrlTree;
      router.parseUrl.and.returnValue(mockUrlTree);

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(router.parseUrl).toHaveBeenCalledWith('**');
        expect(projectPageService.setup).not.toHaveBeenCalled();
        done();
      });
    });

    it('should redirect to 404 when project API call fails', done => {
      const mockUrlTree = {} as UrlTree;
      router.parseUrl.and.returnValue(mockUrlTree);

      // Simulate API error
      Object.defineProperty(projectPageService, 'currentProject$', {
        get: () => throwError(() => new Error('API Error')),
      });

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(router.parseUrl).toHaveBeenCalledWith('**');
        expect(projectPageService.setup).toHaveBeenCalledWith('test-uuid-1234');
        done();
      });
    });

    it('should redirect to 404 when project observable emits undefined', done => {
      const mockUrlTree = {} as UrlTree;
      router.parseUrl.and.returnValue(mockUrlTree);

      // Simulate project not found (observable emits undefined)
      Object.defineProperty(projectPageService, 'currentProject$', {
        get: () => of(undefined),
      });

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(mockUrlTree);
        expect(router.parseUrl).toHaveBeenCalledWith('**');
        done();
      });
    });

    it('should log warning when UUID is missing', done => {
      route.params = {};
      const mockUrlTree = {} as UrlTree;
      router.parseUrl.and.returnValue(mockUrlTree);

      spyOn(console, 'warn');

      guard.canActivate(route, state).subscribe(() => {
        expect(console.warn).toHaveBeenCalledWith('ProjectPageGuard: Missing project UUID in route params');
        done();
      });
    });

    it('should log error when project loading fails', done => {
      const mockError = new Error('Network error');
      const mockUrlTree = {} as UrlTree;
      router.parseUrl.and.returnValue(mockUrlTree);

      Object.defineProperty(projectPageService, 'currentProject$', {
        get: () => throwError(() => mockError),
      });

      spyOn(console, 'error');

      guard.canActivate(route, state).subscribe(() => {
        expect(console.error).toHaveBeenCalledWith('ProjectPageGuard: Failed to load project', {
          projectUuid: 'test-uuid-1234',
          error: mockError,
        });
        done();
      });
    });

    it('should only take first emission from currentProject$ observable', done => {
      let emissionCount = 0;

      // Create an observable that tracks subscriptions
      const trackingObservable = of(mockProject);
      Object.defineProperty(projectPageService, 'currentProject$', {
        get: () => trackingObservable,
      });

      guard.canActivate(route, state).subscribe(() => {
        emissionCount++;
        expect(emissionCount).toBe(1);
        done();
      });
    });
  });
});
