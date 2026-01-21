import { NgClass } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { ActivatedRoute } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';
import { AdvancedSearchResultsComponent } from './advanced-search-results.component';
import { AdvancedSearchComponent } from './advanced-search.component';
import { QueryObject } from './model';

@Component({
  selector: 'app-advanced-search-page',
  template: ` <div class="whole-height" style="display: flex; justify-content: space-around; flex-direction: column">
    <div style="height: 233px">
      <div
        [class.myoverlay]="query"
        [class.expanded]="isExpanded"
        [ngClass]="{ 'mat-elevation-z1': isExpanded }"
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()"
        (focusin)="onFocusIn()"
        (focusout)="onFocusOut()"
        (click)="onContainerClick()">
        <app-centered-layout>
          <app-advanced-search
            [projectUuid]="uuid"
            (gravesearchQuery)="onSearch($event)"
            style="min-width: 960px; padding-left: 16px; padding-right: 16px;" />
        </app-centered-layout>
      </div>
    </div>
    @if (query) {
      <mat-divider [vertical]="true" />
      <app-advanced-search-results-page [query]="query" style="flex: 1" />
    }
  </div>`,
  styleUrls: ['./advanced-search-page.component.scss'],
  imports: [AdvancedSearchComponent, AdvancedSearchResultsComponent, MatDivider, CenteredLayoutComponent, NgClass],
})
export class AdvancedSearchPageComponent implements OnDestroy {
  uuid = this._route.parent!.snapshot.params[RouteConstants.uuidParameter];
  query?: string;
  isExpanded = false;
  isHovering = false;
  private _hasRecentClick = false;

  private _focusOutTimeout?: ReturnType<typeof setTimeout>;
  private _clickTimeout?: ReturnType<typeof setTimeout>;

  constructor(private readonly _route: ActivatedRoute) {}

  ngOnDestroy(): void {
    if (this._focusOutTimeout) {
      clearTimeout(this._focusOutTimeout);
    }
    if (this._clickTimeout) {
      clearTimeout(this._clickTimeout);
    }
  }

  onSearch(queryObject: QueryObject): void {
    this.query = queryObject.query;
  }

  onMouseEnter(): void {
    this.isHovering = true;
    this.isExpanded = true;
  }

  onMouseLeave(): void {
    this.isHovering = false;
    // Only collapse if no overlay is open and no element has focus within the component
    const hasOpenOverlay = !!document.querySelector('.cdk-overlay-container .cdk-overlay-pane');
    const activeElement = document.activeElement;
    const hasFocusInComponent = activeElement?.closest('.myoverlay');

    if (!hasOpenOverlay && !hasFocusInComponent) {
      this.isExpanded = false;
    }
  }

  onFocusIn(): void {
    // Clear any pending focus out timeout
    if (this._focusOutTimeout) {
      clearTimeout(this._focusOutTimeout);
      this._focusOutTimeout = undefined;
    }
    this.isExpanded = true;
  }

  onFocusOut(): void {
    // Delay collapse to allow focus to move to overlay elements
    this._focusOutTimeout = setTimeout(() => {
      // Check if focus is still within a Material overlay (cdk-overlay-container)
      const activeElement = document.activeElement;
      const isInOverlay = activeElement?.closest('.cdk-overlay-container');
      const hasOpenOverlay = !!document.querySelector('.cdk-overlay-container .cdk-overlay-pane');

      // Only collapse if focus has truly left AND no overlay is open AND not hovering AND no recent click
      const shouldCollapse = !isInOverlay && !hasOpenOverlay && !this.isHovering && !this._hasRecentClick;
      if (shouldCollapse) {
        this.isExpanded = false;
      }
      this._focusOutTimeout = undefined;
    }, 200);
  }

  onContainerClick(): void {
    // Mark that we had a recent click to prevent collapse
    this._hasRecentClick = true;
    this.isExpanded = true;

    // Clear any existing timeout
    if (this._clickTimeout) {
      clearTimeout(this._clickTimeout);
    }

    // Reset the flag after a short delay
    this._clickTimeout = setTimeout(() => {
      this._hasRecentClick = false;
    }, 300);
  }
}
