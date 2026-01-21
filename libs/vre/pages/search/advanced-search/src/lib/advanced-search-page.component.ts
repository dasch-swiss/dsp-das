import { Component, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';
import { AngularSplitModule } from 'angular-split';
import { AdvancedSearchResultsComponent } from './advanced-search-results.component';
import { AdvancedSearchComponent } from './advanced-search.component';
import { QueryObject } from './model';

@Component({
  selector: 'app-advanced-search-page',
  template: `<as-split class="whole-height" [direction]="isVertical() ? 'vertical' : 'horizontal'" [gutterSize]="8">
    <as-split-area [size]="query ? 20 : 100">
      <div style="display: flex; flex-direction: column; height: 100%; position: relative">
        @if (query) {
          <button
            style="position: absolute; right: 24px; top: 8px"
            mat-icon-button
            (click)="toggleDirection()"
            [matTooltip]="isVertical() ? 'Switch to horizontal layout' : 'Switch to vertical layout'">
            <mat-icon>{{ isVertical() ? 'vertical_split' : 'horizontal_split' }}</mat-icon>
          </button>
        }
        <app-centered-layout style="flex: 1">
          <app-advanced-search
            [projectUuid]="uuid"
            (gravesearchQuery)="onSearch($event)"
            style="padding-left: 16px; padding-right: 16px" />
        </app-centered-layout>
      </div>
    </as-split-area>
    @if (query) {
      <as-split-area [size]="80">
        <app-advanced-search-results-page [query]="query" />
      </as-split-area>
    }
  </as-split>`,
  styleUrls: ['./advanced-search-page.component.scss'],
  imports: [
    AdvancedSearchComponent,
    AdvancedSearchResultsComponent,
    AngularSplitModule,
    CenteredLayoutComponent,
    MatIcon,
    MatIconButton,
    MatTooltip,
  ],
})
export class AdvancedSearchPageComponent {
  uuid = this._route.parent!.snapshot.params[RouteConstants.uuidParameter];
  query?: string;
  isVertical = signal(true);

  constructor(private readonly _route: ActivatedRoute) {}

  onSearch(queryObject: QueryObject): void {
    this.query = queryObject.query;
  }

  toggleDirection(): void {
    this.isVertical.update(value => !value);
  }
}
