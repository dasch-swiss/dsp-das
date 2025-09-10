import { Provider } from '@angular/core';
import { AdvancedSearchDataService } from './service/advanced-search-data.service';
import { GravsearchService } from './service/gravsearch.service';
import { PreviousSearchService } from './service/previous-search.service';
import { PropertyFormManager } from './service/property-form.manager';
import { SearchStateService } from './service/search-state.service';

/**
 * Provides all services needed for advanced search functionality as singletons
 * within the component tree where this provider is used.
 */
export function provideAdvancedSearch(): Provider[] {
  return [SearchStateService, PropertyFormManager, AdvancedSearchDataService, GravsearchService, PreviousSearchService];
}
