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
  template: ` <div class="whole-height" style="display: flex; flex-direction: column">
    <div style="height: 233px">
      <div
        [class.myoverlay]="query"
        [class.expanded]="isExpanded"
        [ngClass]="{ 'mat-elevation-z1': query && isExpanded }"
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
  private static readonly FOCUS_OUT_DELAY = 200;
  private static readonly CLICK_DELAY = 300;

  uuid = this._route.parent!.snapshot.params[RouteConstants.uuidParameter];
  query?: string;
  isExpanded = false;
  isHovering = false;

  private _hasRecentClick = false;
  private _forceCollapsed = false;
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

    // Collapse the form and prevent re-expansion until mouse leaves
    this._forceCollapsed = true;
    this.isExpanded = false;
    this.isHovering = false;
    this._hasRecentClick = false;

    // Remove focus from search button to allow proper collapse on mouse leave
    (document.activeElement as HTMLElement)?.blur();

    // Clear all pending timeouts
    if (this._focusOutTimeout) {
      clearTimeout(this._focusOutTimeout);
      this._focusOutTimeout = undefined;
    }
    if (this._clickTimeout) {
      clearTimeout(this._clickTimeout);
      this._clickTimeout = undefined;
    }
  }

  onMouseEnter(): void {
    if (this._forceCollapsed) {
      return;
    }
    this.isHovering = true;
    this.isExpanded = true;
  }

  onMouseLeave(): void {
    this.isHovering = false;

    // Collapse if no Material overlay is open and no element within the form has focus
    const hasOpenOverlay = !!document.querySelector('.cdk-overlay-container .cdk-overlay-pane');
    const hasFocusInComponent = document.activeElement?.closest('.myoverlay');

    if (!hasOpenOverlay && !hasFocusInComponent) {
      this.isExpanded = false;
    }

    this._forceCollapsed = false;
  }

  onFocusIn(): void {
    if (this._forceCollapsed) {
      return;
    }
    if (this._focusOutTimeout) {
      clearTimeout(this._focusOutTimeout);
      this._focusOutTimeout = undefined;
    }
    this.isExpanded = true;
  }

  onFocusOut(): void {
    // Delay to allow focus to shift to Material overlay elements
    this._focusOutTimeout = setTimeout(() => {
      const isInOverlay = document.activeElement?.closest('.cdk-overlay-container');
      const hasOpenOverlay = !!document.querySelector('.cdk-overlay-container .cdk-overlay-pane');

      const shouldCollapse = !isInOverlay && !hasOpenOverlay && !this.isHovering && !this._hasRecentClick;
      if (shouldCollapse) {
        this.isExpanded = false;
      }
      this._focusOutTimeout = undefined;
    }, AdvancedSearchPageComponent.FOCUS_OUT_DELAY);
  }

  onContainerClick(): void {
    if (this._forceCollapsed) {
      return;
    }

    this._hasRecentClick = true;
    this.isExpanded = true;

    if (this._clickTimeout) {
      clearTimeout(this._clickTimeout);
    }

    this._clickTimeout = setTimeout(() => {
      this._hasRecentClick = false;
    }, AdvancedSearchPageComponent.CLICK_DELAY);
  }
}
