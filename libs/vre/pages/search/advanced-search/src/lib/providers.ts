import { Provider } from '@angular/core';
import { SearchStateService } from './service/search-state.service';
import { PropertyFormManager } from './service/property-form.manager';
import { AdvancedSearchApiService } from './service/advanced-search-api.service';
import { GravsearchService } from './service/gravsearch.service';
import { PreviousSearchService } from './service/previous-search.service';

/**
 * Provides all services needed for advanced search functionality as singletons
 * within the component tree where this provider is used.
 */
export function provideAdvancedSearch(): Provider[] {
  return [
    SearchStateService,
    PropertyFormManager,
    AdvancedSearchApiService,
    GravsearchService,
    PreviousSearchService,
  ];
}