import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApiResponseError, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ErrorReportingService } from '@dasch-swiss/vre/core/error-handler';
import { ResourceResultService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';
import { SearchResultComponent } from './search-result.component';

/**
 * Failure-path coverage for DEV-6866. `loading` used to be cleared only on the success path, so a
 * failed search left the progress indicator spinning forever; and results were discarded whenever
 * the (more expensive) count query failed. Renders with an empty template — the real child
 * components are irrelevant here — and drives the observable directly.
 */
describe('SearchResultComponent — search failure handling (DEV-6866)', () => {
  const resource = { id: 'http://rdfh.ch/0001/res1', label: 'Test Resource' } as ReadResource;
  let doFulltextSearch: jest.Mock;
  let doFulltextSearchCountQuery: jest.Mock;
  let handleError: jest.Mock;
  let report: jest.Mock;

  const renderComponent = (query = 'der') => {
    const fixture = TestBed.createComponent(SearchResultComponent);
    const component = fixture.componentInstance;
    component.query = query;
    component.ngOnChanges();
    return { component, resourceResult: fixture.debugElement.injector.get(ResourceResultService) };
  };

  beforeEach(() => {
    doFulltextSearch = jest.fn().mockReturnValue(of({ resources: [resource] }));
    doFulltextSearchCountQuery = jest.fn().mockReturnValue(of({ numberOfResults: 1 }));
    handleError = jest.fn();
    report = jest.fn();

    TestBed.configureTestingModule({
      imports: [SearchResultComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: DspApiConnectionToken,
          useValue: { v2: { search: { doFulltextSearch, doFulltextSearchCountQuery } } },
        },
        { provide: ErrorHandler, useValue: { handleError } },
        { provide: ErrorReportingService, useValue: { report } },
      ],
    });
    TestBed.overrideComponent(SearchResultComponent, { set: { template: '', imports: [] } });
  });

  it('stops the spinner and raises the failure state when the search request fails', () => {
    doFulltextSearch.mockReturnValue(throwError(() => new Error('500 from the triplestore')));
    const { component } = renderComponent();

    const sub = component.resources$.subscribe();

    // The regression this test exists for: before the fix `loading` stayed true forever, so the
    // progress indicator kept rendering and nothing told the user the search had already failed.
    expect(component.loading()).toBe(false);
    expect(component.failed()).toBe(true);
    sub.unsubscribe();
  });

  it('still hands the error to the ErrorHandler so the snackbar keeps naming the cause', () => {
    const error = new Error('504 gateway timeout');
    doFulltextSearch.mockReturnValue(throwError(() => error));
    const { component } = renderComponent();

    const sub = component.resources$.subscribe();

    expect(handleError).toHaveBeenCalledWith(error);
    sub.unsubscribe();
  });

  it('renders the results when the count query fails, reporting the count as unknown', () => {
    doFulltextSearchCountQuery.mockReturnValue(throwError(() => new Error('count query timed out')));
    const { component, resourceResult } = renderComponent();

    const emitted: (ReadResource[] | null)[] = [];
    const sub = component.resources$.subscribe(value => emitted.push(value));

    // A count failure must not take down the result list: the count is decorative, the results are not.
    expect(emitted).toEqual([[resource]]);
    expect(component.failed()).toBe(false);
    expect(component.loading()).toBe(false);
    // Null, not the page length: substituting a wrong total would have the UI assert it as fact.
    expect(resourceResult.numberOfResults).toBeNull();
    sub.unsubscribe();
  });

  it('reports a failed count query to telemetry without notifying the user (DEV-6872)', () => {
    const error = new Error('count query timed out');
    doFulltextSearchCountQuery.mockReturnValue(throwError(() => error));
    const { component } = renderComponent();

    const sub = component.resources$.subscribe();

    // The failure used to be swallowed outright, which is what left the DEV-6809 count-query cost and
    // the DEV-6864 timeouts with no production signal at all.
    expect(report).toHaveBeenCalledWith(error, {
      component: 'SearchResultComponent',
      operation: 'fulltextCountQuery',
    });
    // Still deliberately silent towards the user: the result list rendered fine.
    expect(handleError).not.toHaveBeenCalled();
    sub.unsubscribe();
  });

  it('shows the reason dsp-api gave for rejecting the query (DEV-6866)', () => {
    // The real body from GET /v2/search/de*, reported as an eternal spinner and then as an unhelpful
    // "please try again" — advice that cannot work for a query the server will keep rejecting.
    const ajax = Object.create(AjaxError.prototype) as AjaxError;
    Object.assign(ajax, {
      status: 400,
      message: 'ajax error 400',
      name: 'AjaxError',
      response: { message: 'A wildcard search term must contain at least 3 characters besides the wildcard.' },
    });
    const rejected = Object.create(ApiResponseError.prototype) as ApiResponseError;
    Object.assign(rejected, { status: 400, error: ajax, url: '/v2/search/de*', method: 'GET' });
    doFulltextSearch.mockReturnValue(throwError(() => rejected));

    const { component } = renderComponent('de*');
    const sub = component.resources$.subscribe();

    expect(component.loading()).toBe(false);
    expect(component.failed()).toBe(true);
    expect(component.failureReason()).toBe(
      'A wildcard search term must contain at least 3 characters besides the wildcard.'
    );
    sub.unsubscribe();
  });

  it('falls back to the generic wording when the failure carries no usable reason', () => {
    doFulltextSearch.mockReturnValue(throwError(() => new Error('socket hang up')));

    const { component } = renderComponent();
    const sub = component.resources$.subscribe();

    expect(component.failed()).toBe(true);
    expect(component.failureReason()).toBeUndefined();
    sub.unsubscribe();
  });

  it('clears a previously known count when a later page request fails', () => {
    doFulltextSearchCountQuery.mockReturnValue(of({ numberOfResults: 1000 }));
    const { component, resourceResult } = renderComponent();

    const sub = component.resources$.subscribe();
    expect(resourceResult.numberOfResults).toBe(1000);

    doFulltextSearch.mockReturnValue(throwError(() => new Error('page 2 timed out')));
    resourceResult.updatePageIndex(1);

    // Leaving 1000 here would have the service report a total for results that are no longer on
    // screen, contradicting its own "null means genuinely unknown" contract.
    expect(component.failed()).toBe(true);
    expect(resourceResult.numberOfResults).toBeNull();
    sub.unsubscribe();
  });

  it('re-runs the search when the failure state is retried', () => {
    doFulltextSearch
      .mockReturnValueOnce(throwError(() => new Error('transient failure')))
      .mockReturnValue(of({ resources: [resource] }));
    const { component } = renderComponent();

    const emitted: (ReadResource[] | null)[] = [];
    const sub = component.resources$.subscribe(value => emitted.push(value));
    expect(component.failed()).toBe(true);

    component.onRetry();

    expect(component.failed()).toBe(false);
    expect(component.loading()).toBe(false);
    expect(emitted.at(-1)).toEqual([resource]);
    expect(doFulltextSearch).toHaveBeenCalledTimes(2);
    sub.unsubscribe();
  });
});
