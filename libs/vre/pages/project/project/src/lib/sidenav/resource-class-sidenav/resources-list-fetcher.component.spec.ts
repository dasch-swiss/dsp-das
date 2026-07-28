import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ReadProject, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/core/config';
import { MultipleViewerService } from '@dasch-swiss/vre/pages/data-browser';
import { DataBrowserPageService, ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { OntologyService, ResourceResultService } from '@dasch-swiss/vre/shared/app-helper-services';
import { BehaviorSubject, firstValueFrom, of, throwError } from 'rxjs';
import { ResourcesListFetcherComponent } from './resources-list-fetcher.component';

describe('ResourcesListFetcherComponent', () => {
  let component: ResourcesListFetcherComponent;
  let fixture: ComponentFixture<ResourcesListFetcherComponent>;
  let mockDspApiConnection: any;
  let mockResourceResult: any;
  let mockMultipleViewerService: any;
  let routeParamsSubject: BehaviorSubject<any>;
  let currentProjectSubject: BehaviorSubject<ReadProject>;
  let handleError: jest.Mock;

  const mockResource1 = { id: 'resource-1', label: 'Resource 1' } as ReadResource;
  const mockResource2 = { id: 'resource-2', label: 'Resource 2' } as ReadResource;
  const mockProject = { shortcode: '0001' } as ReadProject;

  beforeEach(async () => {
    routeParamsSubject = new BehaviorSubject({ [RouteConstants.classParameter]: 'TestClass' });
    currentProjectSubject = new BehaviorSubject(mockProject);

    mockDspApiConnection = {
      v2: {
        search: {
          doExtendedSearch: jest.fn().mockReturnValue(of({ resources: [] })),
          doExtendedSearchCountQuery: jest.fn().mockReturnValue(of({ numberOfResults: 0 })),
        },
      },
    };

    mockResourceResult = {
      updatePageIndex: jest.fn(),
      pageIndex$: of(0),
      numberOfResults: 0,
    };

    mockMultipleViewerService = {
      selectOneResource: jest.fn(),
      reset: jest.fn(),
      selectMode: false,
      selectedResources$: of([]),
    };

    handleError = jest.fn();

    await TestBed.configureTestingModule({
      imports: [ResourcesListFetcherComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: { params: routeParamsSubject.asObservable() } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: DspApiConnectionToken, useValue: mockDspApiConnection },
        { provide: ResourceResultService, useValue: mockResourceResult },
        { provide: OntologyService, useValue: { getIriBaseUrl: () => 'http://api.knora.org' } },
        { provide: ProjectPageService, useValue: { currentProject$: currentProjectSubject.asObservable() } },
        { provide: MultipleViewerService, useValue: mockMultipleViewerService },
        { provide: DataBrowserPageService, useValue: { onNavigationReload$: of(undefined) } },
        { provide: ErrorHandler, useValue: { handleError } },
      ],
    })
      .overrideComponent(ResourcesListFetcherComponent, {
        set: { template: '<div>Mock</div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ResourcesListFetcherComponent);
    component = fixture.componentInstance;
    component.ontologyLabel = 'testonto';
    component.classLabel = 'TestClass';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should auto-select first resource when class has resources', async () => {
    mockDspApiConnection.v2.search.doExtendedSearch.mockReturnValue(of({ resources: [mockResource1, mockResource2] }));
    mockDspApiConnection.v2.search.doExtendedSearchCountQuery.mockReturnValue(of({ numberOfResults: 2 }));

    component.ngOnChanges();

    await firstValueFrom(component.data$);

    expect(mockMultipleViewerService.selectOneResource).toHaveBeenCalledWith(mockResource1);
  });

  it('should call reset when navigating to empty class', async () => {
    mockDspApiConnection.v2.search.doExtendedSearch.mockReturnValue(of({ resources: [] }));
    mockDspApiConnection.v2.search.doExtendedSearchCountQuery.mockReturnValue(of({ numberOfResults: 0 }));

    component.ngOnChanges();

    await firstValueFrom(component.data$);

    expect(mockMultipleViewerService.reset).toHaveBeenCalled();
  });

  it('should not auto-select when selectMode is true', async () => {
    mockMultipleViewerService.selectMode = true;
    mockDspApiConnection.v2.search.doExtendedSearch.mockReturnValue(of({ resources: [mockResource1, mockResource2] }));
    mockDspApiConnection.v2.search.doExtendedSearchCountQuery.mockReturnValue(of({ numberOfResults: 2 }));

    component.ngOnChanges();

    await firstValueFrom(component.data$);

    expect(mockMultipleViewerService.selectOneResource).not.toHaveBeenCalled();
  });

  /**
   * Failure-path coverage for DEV-6871. The component previously had no error handling at all, so any
   * failure left `data$` non-emitting and the template rendered the progress indicator forever.
   */
  describe('failure handling (DEV-6871)', () => {
    /** Collects every emission, unlike firstValueFrom, so the retry case can be observed. */
    const collectData = () => {
      const emitted: ({ resources: ReadResource[]; selectFirstResource: boolean } | null)[] = [];
      const sub = component.data$.subscribe(value => emitted.push(value));
      return { emitted, sub };
    };

    it('still renders the resource list when the count query fails', () => {
      mockDspApiConnection.v2.search.doExtendedSearch.mockReturnValue(
        of({ resources: [mockResource1, mockResource2] })
      );
      mockDspApiConnection.v2.search.doExtendedSearchCountQuery.mockReturnValue(
        throwError(() => new Error('count query timed out'))
      );

      component.ngOnChanges();
      const { emitted, sub } = collectData();

      // A count failure must not take down the resource list: the count is decorative, the list is not.
      expect(emitted.at(-1)?.resources).toEqual([mockResource1, mockResource2]);
      expect(component.failed()).toBe(false);
      // The component provides its own ResourceResultService, so read that instance rather than the
      // module-level mock, which this component never sees.
      expect(fixture.debugElement.injector.get(ResourceResultService).numberOfResults).toBe(2);
      sub.unsubscribe();
    });

    it('does not claim missing permissions when the count query fails on an empty page', () => {
      mockDspApiConnection.v2.search.doExtendedSearch.mockReturnValue(of({ resources: [] }));
      mockDspApiConnection.v2.search.doExtendedSearchCountQuery.mockReturnValue(
        throwError(() => new Error('count query timed out'))
      );

      component.ngOnChanges();
      const { emitted, sub } = collectData();

      // Assert the emission first: without it this test would also pass against the unfixed code,
      // where the count error kills the stream and the flag merely keeps its initial `true`.
      expect(emitted).toHaveLength(1);
      // An unknown count cannot support the "class has resources but none came back" inference, so it
      // must never render the no-permissions message.
      expect(component.userCanViewResources).toBe(true);
      sub.unsubscribe();
    });

    it('still reports missing permissions when the count succeeds and reports hidden resources', () => {
      mockDspApiConnection.v2.search.doExtendedSearch.mockReturnValue(of({ resources: [] }));
      mockDspApiConnection.v2.search.doExtendedSearchCountQuery.mockReturnValue(of({ numberOfResults: 5 }));

      component.ngOnChanges();
      const { sub } = collectData();

      // The inference itself must survive the rewrite that made the count nullable.
      expect(component.userCanViewResources).toBe(false);
      sub.unsubscribe();
    });

    it('stops the spinner and raises the failure state when the resource query fails', () => {
      mockDspApiConnection.v2.search.doExtendedSearch.mockReturnValue(
        throwError(() => new Error('500 from the triplestore'))
      );

      component.ngOnChanges();
      const { emitted, sub } = collectData();

      // The regression this guards: with no catchError, data$ never emitted and the template's @else
      // branch kept the progress indicator on screen indefinitely.
      expect(component.failed()).toBe(true);
      expect(emitted.at(-1)).toBeNull();
      expect(handleError).toHaveBeenCalled();
      sub.unsubscribe();
    });

    it('re-runs the load when the failure state is retried', () => {
      mockDspApiConnection.v2.search.doExtendedSearch
        .mockReturnValueOnce(throwError(() => new Error('transient failure')))
        .mockReturnValue(of({ resources: [mockResource1] }));

      component.ngOnChanges();
      const { emitted, sub } = collectData();
      expect(component.failed()).toBe(true);

      component.onRetry();

      expect(component.failed()).toBe(false);
      expect(emitted.at(-1)?.resources).toEqual([mockResource1]);
      sub.unsubscribe();
    });
  });
});
