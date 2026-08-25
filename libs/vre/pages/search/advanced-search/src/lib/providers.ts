import { Provider } from '@angular/core';
import { DerivedSearchStateService } from './service/derived-search-state.service';
import { DynamicFormsDataService } from './service/dynamic-forms-data.service';
import { GravsearchService } from './service/gravsearch.service';
import { ListNodeLabelResolver } from './service/list-node-label.resolver';
import { OntologyDataService } from './service/ontology-data.service';
import { SearchFlowLogger } from './service/search-flow-logger.service';
import { SearchUrlSyncService } from './service/search-url-sync.service';
import { StatementDraftStore } from './service/statement-draft.store';

export function provideAdvancedSearch(): Provider[] {
  return [
    StatementDraftStore,
    OntologyDataService,
    DynamicFormsDataService,
    GravsearchService,
    ListNodeLabelResolver,
    SearchUrlSyncService,
    DerivedSearchStateService,
    SearchFlowLogger,
  ];
}
