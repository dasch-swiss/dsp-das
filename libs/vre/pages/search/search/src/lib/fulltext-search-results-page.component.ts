import { Component } from '@angular/core';

@Component({
  selector: 'app-fulltext-search-results-page',
  template: `<app-project-fulltext-search-result [query]="'heidi'" />`,
})
export class FulltextSearchResultsPageComponent {}
