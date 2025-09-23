import { Component } from '@angular/core';

@Component({
  selector: 'app-project-search-page',
  template: `
    @if (isFulltextSearch) {
      <app-project-fulltext-search-page (goToAdvancedSearch)="isFulltextSearch = false" />
    } @else {
      <app-advanced-search-page />
    }
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 16px;
      }
    `,
  ],
})
export class ProjectSearchPageComponent {
  isFulltextSearch = true;
}
