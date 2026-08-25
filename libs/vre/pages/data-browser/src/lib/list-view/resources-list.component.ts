import { Component, Input, OnChanges, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { ResourceResultService } from '@dasch-swiss/vre/shared/app-helper-services';
import { AppProgressIndicatorComponent } from '@dasch-swiss/vre/ui/progress-indicator';
import { PagerComponent } from '@dasch-swiss/vre/ui/ui';
import { TranslatePipe } from '@ngx-translate/core';
import { isImageRepresentation } from './image-representation';
import { ResourceImageListComponent } from './resource-image-list.component';
import { ResourceListComponent } from './resource-list.component';

@Component({
  selector: 'app-resources-list',
  template: `
    @if (loading) {
      <app-progress-indicator data-testid="loader" />
    } @else {
      @let numberOfResults = resourceResultService.numberOfResults;
      <div class="results-header">
        @if (numberOfResults === null) {
          <!-- The count query failed. Say so rather than asserting a total we do not have: the pager
               cannot be sized either, so paging is unavailable until the next successful load. -->
          <div class="results-count" data-cy="count-unavailable">
            {{ 'pages.dataBrowser.resourcesList.countUnavailable' | translate }}
          </div>
        } @else if (numberOfResults > resourceResultService.MAX_RESULTS_PER_PAGE) {
          <app-pager (pageIndexChanged)="updatePageIndex($event)" [numberOfAllResults]="numberOfResults" />
        } @else {
          <div class="results-count">
            {{ 'pages.dataBrowser.resourcesList.resultsCount' | translate: { count: numberOfResults } }}
          </div>
        }

        @if (supportsGridView()) {
          <mat-button-toggle-group
            [value]="view()"
            (valueChange)="view.set($event)"
            hideSingleSelectionIndicator
            data-cy="view-toggle">
            <mat-button-toggle
              value="list"
              [matTooltip]="'pages.dataBrowser.resourcesList.listView' | translate"
              [attr.aria-label]="'pages.dataBrowser.resourcesList.listView' | translate">
              <mat-icon>view_list</mat-icon>
            </mat-button-toggle>
            <mat-button-toggle
              value="grid"
              [matTooltip]="'pages.dataBrowser.resourcesList.gridView' | translate"
              [attr.aria-label]="'pages.dataBrowser.resourcesList.gridView' | translate">
              <mat-icon>grid_view</mat-icon>
            </mat-button-toggle>
          </mat-button-toggle-group>
        }
      </div>

      @if (view() === 'grid' && supportsGridView()) {
        <app-resource-image-list [resources]="resources" />
      } @else {
        <app-resource-list
          [resources]="resources"
          [showProjectShortname]="showProjectShortname"
          [showResourceClass]="showResourceClass" />
      }
    }
  `,
  styleUrls: ['./resources-list.component.scss'],
  imports: [
    AppProgressIndicatorComponent,
    PagerComponent,
    ResourceListComponent,
    ResourceImageListComponent,
    MatButtonToggleModule,
    MatIconModule,
    MatTooltipModule,
    TranslatePipe,
  ],
})
export class ResourcesListComponent implements OnChanges {
  @Input({ required: true }) resources!: ReadResource[];
  @Input() showProjectShortname = false;
  @Input() showResourceClass = false;
  @Input() loading = false;

  readonly view = signal<'list' | 'grid'>('list');

  /**
   * Thumbnails only make sense where every result can have one, so a mixed set of classes — which
   * search results routinely are — keeps the plain list and hides the toggle entirely.
   */
  readonly supportsGridView = signal(false);

  constructor(public resourceResultService: ResourceResultService) {}

  ngOnChanges() {
    this.supportsGridView.set(this.resources?.length > 0 && this.resources.every(isImageRepresentation));
  }

  updatePageIndex(index: number) {
    this.resourceResultService.updatePageIndex(index);
  }
}
