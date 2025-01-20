import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dasch-swiss-app-pager',
  imports: [MatIconModule, MatButtonModule, TranslateModule, MatInputModule, MatTooltipModule, NgIf, AsyncPipe],
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.scss'],
})
export class PagerComponent implements OnChanges {
  @Input() numberOfAllResults = 0;
  @Input() pageSize = 25;

  @Output() pageIndexChanged: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('pageInput') private _pageInput!: ElementRef<HTMLInputElement>;

  private _pageIndex = 0;

  actionBubbleVisible$ = new BehaviorSubject<boolean>(false);

  get pageIndex(): number {
    return this._pageIndex;
  }

  set pageIndex(val: number) {
    this._pageIndex = val;
    this.pageIndexChanged.emit(val);
  }

  get lastPageIndex(): number {
    return this.numberOfAllResults ? Math.ceil(this.numberOfAllResults / this.pageSize) - 1 : 0;
  }

  get inputPage(): number | undefined {
    return this._pageInput.nativeElement.value ? parseInt(this._pageInput.nativeElement.value, 10) : undefined;
  }

  get pageUnChanged(): boolean {
    return this.inputPage === this._pageIndex + 1;
  }

  get itemRange(): string {
    const itemRangeStart = this.numberOfAllResults ? this._pageIndex * this.pageSize + 1 : 0;
    const itemRangeEnd = Math.min((this._pageIndex + 1) * this.pageSize, this.numberOfAllResults);
    return `${itemRangeStart} - ${itemRangeEnd} ${this._translate.instant('paginator.rangeLabelOf')} ${this.numberOfAllResults}`;
  }

  constructor(private _translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['numberOfAllResults']) {
      this._pageIndex = 0;
    }
  }

  private _goToPage() {
    if (!this.inputPage || this.pageUnChanged) {
      this._pageInput.nativeElement.blur();
      return;
    }
    // if the user inputs a far off number set it to the closest available page
    const clampedPage = Math.max(1, Math.min(this.inputPage, this.lastPageIndex + 1));
    if (clampedPage !== this.inputPage) {
      this._pageInput.nativeElement.value = clampedPage.toString();
    }
    this.pageIndex = clampedPage - 1;
  }

  onEnterPressed() {
    this._goToPage();
    this._pageInput.nativeElement.blur();
  }

  onGoToClicked() {
    this._goToPage();
    this.actionBubbleVisible$.next(false);
  }

  onInputFocussed(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
    this.actionBubbleVisible$.next(true);
  }

  onInputBlurred() {
    setTimeout(() => {
      this.actionBubbleVisible$.next(false);
      // reset the input value to the current page, might have been changed
      this._pageInput.nativeElement.value = (this._pageIndex + 1).toString();
    }, 200);
  }
}
