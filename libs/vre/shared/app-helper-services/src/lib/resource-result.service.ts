import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ResourceResultService {
  private _pageIndexSubject = new BehaviorSubject(0);
  pageIndex$ = this._pageIndexSubject.asObservable();

  /**
   * Total number of results across all pages, or `null` when the count query failed and the total is
   * genuinely unknown. Nullable rather than "0" or the current page's length on purpose: consumers
   * present this figure to the user, and substituting a wrong total is worse than admitting an
   * unknown one (DEV-6866).
   */
  numberOfResults: number | null = 0;
  readonly MAX_RESULTS_PER_PAGE = 25;

  updatePageIndex(newIndex: number): void {
    this._pageIndexSubject.next(newIndex);
  }
}
