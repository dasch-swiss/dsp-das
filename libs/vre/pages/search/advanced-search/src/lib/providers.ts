import { Provider } from '@angular/core';
import { AdvancedSearchDataService } from './service/advanced-search-data.service';
import { DynamicFormsDataService } from './service/dynamic-forms-data.service';
import { GravsearchService } from './service/gravsearch.service';
import { OrderByService } from './service/order-by.service';
import { PreviousSearchService } from './service/previous-search.service';
import { PropertyFormManager } from './service/property-form.manager';
import { SearchStateService } from './service/search-state.service';

export function provideAdvancedSearch(): Provider[] {
  return [
    SearchStateService,
    OrderByService,
    PropertyFormManager,
    AdvancedSearchDataService,
    DynamicFormsDataService,
    GravsearchService,
    PreviousSearchService,
  ];
}
