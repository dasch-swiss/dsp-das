import { Component } from '@angular/core';

@Component({
  selector: 'app-project-fulltext-search-page',
  template: `
    <p>Search through all text content in the project.</p>
    <form>
      <div style="display: flex; align-items: center; gap: 16px">
        <mat-form-field appearance="outline" style="flex: 1">
          <mat-label>Search</mat-label>
          <input matInput type="text" placeholder="Enter search term..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <button mat-flat-button color="primary" type="submit">Search</button>
      </div>
    </form>
  `,
  styles: [
    `
      :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none !important;
      }
    `,
  ],
})
export class ProjectFulltextSearchPageComponent {}
