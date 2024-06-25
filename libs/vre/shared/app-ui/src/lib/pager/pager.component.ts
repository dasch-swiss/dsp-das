import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dasch-swiss-app-pager',
  imports: [NgIf, MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.scss'],
})
export class PagerComponent {
  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();
  @Input() set numberOfAllResults(value: number) {
    this._numberOfAllResults = value;
    this.currentRangeEnd = this.numberOfAllResults > 25 ? 25 : this.numberOfAllResults;
  }
  get numberOfAllResults(): number {
    return this._numberOfAllResults;
  }

  readonly pageSize = 25;

  private _numberOfAllResults: number = 0;

  currentIndex = 0;
  currentRangeStart = 1;
  currentRangeEnd = 0;

  previousDisabled = false;
  nextDisabled = false;

  initPager(): void {
    this.currentIndex = 0;
    this.currentRangeStart = 1;
    this.currentRangeEnd = 0;
    this.nextDisabled = false;
  }

  goToPage(direction: 'previous' | 'next') {
    if (direction === 'previous') {
      if (this.currentIndex > 0) {
        this.nextDisabled = false;
        this.currentIndex -= 1;
      }
    }
    if (direction === 'next') {
      this.currentIndex += 1;

      // if end range for the next page of results is greater than the total number of results
      if (this.pageSize * (this.currentIndex + 1) >= this.numberOfAllResults) {
        this.nextDisabled = true;
      }
    }

    this._calculateRange(this.currentIndex);
    this.pageChanged.emit(this.currentIndex);
  }

  /**
   * @param page offset
   */
  private _calculateRange(page: number) {
    this.currentRangeStart = this.pageSize * page + 1;

    if (this.pageSize * (page + 1) > this.numberOfAllResults) {
      this.currentRangeEnd = this.numberOfAllResults;
    } else {
      this.currentRangeEnd = this.pageSize * (page + 1);
    }
  }
}
