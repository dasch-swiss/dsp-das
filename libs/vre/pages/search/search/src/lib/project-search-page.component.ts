import { Component } from '@angular/core';

@Component({
  selector: 'app-project-search-page',
  template: `
    <app-centered-layout>
      <div style="display: flex; justify-content: center">
        <app-double-chip-selector [(value)]="isFulltextSearch" [options]="['Fulltext search', 'Advanced search']" />
      </div>
      @if (isFulltextSearch) {
        <app-project-fulltext-search-page />
      } @else {
        <app-advanced-search-page />
      }
    </app-centered-layout>
  `,
})
export class ProjectSearchPageComponent {
  isFulltextSearch = true;
}
