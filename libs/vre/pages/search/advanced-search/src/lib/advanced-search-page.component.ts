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
        [ngClass]="{ 'mat-elevation-z1': query }"
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()"
        (focusin)="onFocusIn()"
        (focusout)="onFocusOut($event)">
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

  private _focusOutTimeout?: ReturnType<typeof setTimeout>;
  private _clickListener?: () => void;

  constructor(private readonly _route: ActivatedRoute) {
    // Listen for clicks on overlay backdrop to collapse
    this._clickListener = () => {
      // Check if click was on overlay backdrop
      const hasOverlay = document.querySelector('.cdk-overlay-container .cdk-overlay-backdrop');
      if (!hasOverlay) {
        // No overlay visible, safe to check if we should collapse
        const activeElement = document.activeElement;
        const isInComponent = activeElement?.closest('.myoverlay');
        if (!isInComponent) {
          this.isExpanded = false;
        }
      }
    };
    document.addEventListener('click', this._clickListener);
  }

  ngOnDestroy(): void {
    if (this._clickListener) {
      document.removeEventListener('click', this._clickListener);
    }
    if (this._focusOutTimeout) {
      clearTimeout(this._focusOutTimeout);
    }
  }

  onSearch(queryObject: QueryObject): void {
    this.query = queryObject.query;
  }

  onMouseEnter(): void {
    this.isExpanded = true;
  }

  onMouseLeave(): void {
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

  onFocusOut(event: FocusEvent): void {
    // Delay collapse to allow focus to move to overlay elements
    this._focusOutTimeout = setTimeout(() => {
      // Check if focus is still within a Material overlay (cdk-overlay-container)
      const activeElement = document.activeElement;
      const isInOverlay = activeElement?.closest('.cdk-overlay-container');
      const hasOpenOverlay = !!document.querySelector('.cdk-overlay-container .cdk-overlay-pane');

      // Only collapse if focus has truly left AND no overlay is open
      if (!isInOverlay && !hasOpenOverlay) {
        this.isExpanded = false;
      }
      this._focusOutTimeout = undefined;
    }, 200);
  }
}
