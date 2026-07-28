import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceResultService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
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

    TestBed.configureTestingModule({
      imports: [SearchResultComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: DspApiConnectionToken,
          useValue: { v2: { search: { doFulltextSearch, doFulltextSearchCountQuery } } },
        },
        { provide: ErrorHandler, useValue: { handleError } },
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
