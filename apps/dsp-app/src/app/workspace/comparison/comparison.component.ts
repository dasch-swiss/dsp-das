import { Component, Input, OnChanges } from '@angular/core';
import { ShortResInfo } from '../results/list-view/list-view.component';
import { SplitSize } from '../results/results.component';

@Component({
  selector: 'app-comparison',
  template: `
    <div class="content">
      <as-split direction="vertical">
        <as-split-area>
          <!-- note: This part is repeating twice (not added as component) because angular-split
                                                              library does not support addition div inside as-split -->
          <as-split direction="horizontal" (dragEnd)="splitSizeChanged = $event">
            <as-split-area *ngFor="let res of topRow">
              <app-resource-fetcher [resourceIri]="res" />
            </as-split-area>
          </as-split>
        </as-split-area>
        <as-split-area *ngIf="resourcesNumber > 3">
          <as-split direction="horizontal" (dragEnd)="splitSizeChanged = $event">
            <as-split-area *ngFor="let res of bottomRow">
              <app-resource-fetcher [resourceIri]="res" />
            </as-split-area>
          </as-split>
        </as-split-area>
      </as-split>
    </div>
  `,
  styles: [
    `
      .content {
        width: 100%;
        height: 1400px;
      }
    `,
  ],
})
export class ComparisonComponent implements OnChanges {
  @Input() resourcesNumber?: number;
  @Input() resourceIds?: string[];
  @Input() resources?: ShortResInfo[];

  // parent (or own) split size changed
  @Input() splitSizeChanged: SplitSize;

  topRow: string[] = [];
  bottomRow: string[] = [];

  ngOnChanges(): void {
    if (this.resources && this.resources.length) {
      this.resourceIds = this.resources.map(res => res.id);
    }

    if (!this.resourcesNumber) {
      this.resourcesNumber =
        this.resourceIds && this.resourceIds.length ? this.resourceIds.length : this.resources.length;
    }

    // if number of resources are more than 3, divide it into 2 rows
    // otherwise display then in 1 row only
    if (this.resourcesNumber < 4) {
      this.topRow = this.resourceIds;
    } else {
      this.topRow = this.resourceIds.slice(0, this.resourcesNumber / 2);
      this.bottomRow = this.resourceIds.slice(this.resourcesNumber / 2);
    }
  }
}
