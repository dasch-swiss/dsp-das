import { Component } from '@angular/core';

@Component({
  selector: 'app-project-search-page',
  template: `
    <div style="display: flex; justify-content: center">
      <app-double-chip-selector
        [(value)]="isFulltextSearch"
        [options]="['Fulltext search', 'Advanced search']"
        style="margin-bottom: 32px" />
    </div>
    @if (isFulltextSearch) {
      <app-project-fulltext-search-page />
    } @else {
      <app-advanced-search-page />
    }
  `,
})
export class ProjectSearchPageComponent {
  isFulltextSearch = true;
}
