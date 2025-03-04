import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-incoming-resource-pager',
  template: `
    <div class="paging-container">
      <div class="navigation">
        <button mat-button class="pagination-button previous" [disabled]="pageIndex === 0" (click)="changePage(-1)">
          <mat-icon>west</mat-icon>
          <span>{{ 'uiControls.pager.previous' | translate }}</span>
        </button>
        <span class="fill-remaining-space"></span>
        <div class="range">
          <span>{{ itemRangeStart }} - {{ itemRangeEnd }}</span>
        </div>
        <span class="fill-remaining-space"></span>
        <button
          mat-button
          class="pagination-button next"
          [disabled]="pageIndex === lastPageIndex"
          (click)="changePage(1)">
          <span>{{ 'uiControls.pager.next' | translate }}</span>
          <mat-icon>east</mat-icon>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./incoming-resource-pager.component.scss'],
})
export class IncomingResourcePagerComponent {
  @Input({ required: true }) pageIndex!: number;
  @Input({ required: true }) pageSize!: number;
  @Input({ required: true }) itemsNumber!: number;
  @Input() lastPageIndex?: number;

  @Output() pageChanged = new EventEmitter<number>();

  get itemRangeStart(): number {
    return this.pageSize * this.pageIndex + 1;
  }

  get itemRangeEnd(): number | undefined {
    return this.itemsNumber + this.itemRangeStart - 1;
  }

  changePage(dir: 1 | -1) {
    this.pageIndex += dir;
    this.pageChanged.emit(this.pageIndex);
  }
}
