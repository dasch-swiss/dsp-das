import { Component, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { AngularSplitModule, SplitComponent } from 'angular-split';
import { AdvancedSearchResultsComponent } from './advanced-search-results.component';
import { AdvancedSearchComponent } from './advanced-search.component';
import { QueryObject } from './model';

@Component({
  selector: 'app-advanced-search-page',
  template: `<as-split
    #split
    class="whole-height"
    [direction]="isVertical() ? 'vertical' : 'horizontal'"
    (dragEnd)="onDragEnd($event)">
    <as-split-area [size]="query ? 50 : 100">
      <div style="display: flex; flex-direction: column; height: 100%; position: relative">
        <div style="display: flex; justify-content: center; flex: 1">
          <app-advanced-search
            [isVerticalDirection]="query ? isVertical() : undefined"
            (toggleDirection)="toggleDirection()"
            [projectUuid]="uuid"
            (gravesearchQuery)="onSearch($event)"
            style="max-width: 900px; width: 100%; padding-left: 16px; padding-right: 16px" />
        </div>
      </div>
    </as-split-area>
    @if (query) {
      <as-split-area [size]="50">
        <app-advanced-search-results-page [query]="query" />
      </as-split-area>
    }
  </as-split>`,
  styleUrls: ['./advanced-search-page.component.scss'],
  imports: [AdvancedSearchComponent, AdvancedSearchResultsComponent, AngularSplitModule],
})
export class AdvancedSearchPageComponent implements OnInit {
  private static readonly STORAGE_KEY_DIRECTION = 'advanced-search-split-direction';
  private static readonly STORAGE_KEY_RATIO = 'advanced-search-split-ratio';

  @ViewChild('split') split?: SplitComponent;

  uuid = this._route.parent!.snapshot.params[RouteConstants.uuidParameter];
  query?: string;
  isVertical = signal(this.loadDirection());

  constructor(private readonly _route: ActivatedRoute) {}

  ngOnInit() {
    console.log('query', this.query);
  }
  onSearch(queryObject: QueryObject): void {
    this.query = queryObject.query;

    // Restore saved ratio when query results appear
    setTimeout(() => {
      if (this.split && this.query) {
        const savedRatio = this.loadRatio();
        if (savedRatio) {
          this.split.setVisibleAreaSizes(savedRatio);
        }
      }
    }, 0);
  }

  toggleDirection(): void {
    this.isVertical.update(value => {
      const newValue = !value;
      this.saveDirection(newValue);

      // Reset to original ratio after direction change
      setTimeout(() => {
        if (this.split && this.query) {
          const sizes = newValue ? [50, 50] : this.getHorizontalSizes();
          this.split.setVisibleAreaSizes(sizes);
        }
      }, 0);

      return newValue;
    });
  }

  onDragEnd(event: { gutterNum: number; sizes: number[] }): void {
    // Save the new ratio when user manually adjusts the split
    if (this.query) {
      this.saveRatio(event.sizes as [number, number]);
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    // Only recalculate on resize if in horizontal mode and query exists
    if (!this.isVertical() && this.query && this.split) {
      const sizes = this.getHorizontalSizes();
      this.split.setVisibleAreaSizes(sizes);
      this.saveRatio(sizes);
    }
  }

  private getHorizontalSizes(): [number, number] {
    const screenWidth = window.innerWidth;
    const firstColumnSize = screenWidth < 1980 ? 33 : 25;
    return [firstColumnSize, 100 - firstColumnSize];
  }

  private loadDirection(): boolean {
    const stored = localStorage.getItem(AdvancedSearchPageComponent.STORAGE_KEY_DIRECTION);
    return stored !== null ? stored === 'vertical' : true;
  }

  private saveDirection(isVertical: boolean): void {
    localStorage.setItem(AdvancedSearchPageComponent.STORAGE_KEY_DIRECTION, isVertical ? 'vertical' : 'horizontal');
  }

  private loadRatio(): [number, number] | null {
    const stored = localStorage.getItem(AdvancedSearchPageComponent.STORAGE_KEY_RATIO);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 2) {
          return parsed as [number, number];
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  private saveRatio(sizes: [number, number]): void {
    localStorage.setItem(AdvancedSearchPageComponent.STORAGE_KEY_RATIO, JSON.stringify(sizes));
  }
}
