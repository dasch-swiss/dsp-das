import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() pageSize = 25;
  @Input() numberOfAllResults: number | undefined = undefined;
  @Input() lastItemOfPage: number | undefined = undefined;
  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();

  currentIndex = 0;

  get isLastOnPage(): boolean {
    if (this.numberOfAllResults) {
      return this.pageSize * (this.currentIndex + 1) >= this.numberOfAllResults;
    } else {
      return this.lastItemOfPage !== undefined && this.lastItemOfPage < this.pageSize;
    }
  }

  get itemRangeStart(): number {
    return this.pageSize * this.currentIndex + 1;
  }

  get itemRangeEnd(): number {
    if (this.lastItemOfPage) {
      return this.lastItemOfPage;
    }
    if (this.numberOfAllResults !== undefined) {
      return this.pageSize * (this.currentIndex + 1) > this.numberOfAllResults
        ? this.numberOfAllResults
        : this.pageSize * (this.currentIndex + 1);
    }
    return 0;
  }

  get lastPageIndex(): number {
    return this.numberOfAllResults ? Math.ceil(this.numberOfAllResults / this.pageSize) - 1 : 0;
  }

  get pages(): number[] {
    return Array.from({ length: this.lastPageIndex + 1 }, (_, i) => i + 1);
  }

  goToPage(pageIndex: number) {
    this.currentIndex = pageIndex;
    this.pageChanged.emit(pageIndex);
  }
}
