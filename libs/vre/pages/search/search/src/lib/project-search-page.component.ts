import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { AdvancedSearchPageComponent } from '@dasch-swiss/vre/pages/search/advanced-search';
import { ProjectFulltextSearchPageComponent } from './project-fulltext-search-page.component';

@Component({
  selector: 'app-project-search-page',
  template: `
    <mat-tab-group>
      <mat-tab label="Fulltext search">
        <app-project-fulltext-search-page />
      </mat-tab>

      <mat-tab label="Advanced search">
        <app-advanced-search-page />
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 16px;
      }
    `,
  ],
  imports: [ProjectFulltextSearchPageComponent, AdvancedSearchPageComponent, MatTabGroup, MatTab, MatButton, MatIcon],
})
export class ProjectSearchPageComponent {}
