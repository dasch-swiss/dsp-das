import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompoundNavigationService {
  private _totalPages = new BehaviorSubject<number>(0);
  public totalPages$: Observable<number> = this._totalPages.asObservable();

  private _currentPage = new BehaviorSubject<number>(0);
  public currentPage$: Observable<number> = this._currentPage.asObservable();

  constructor() {}

  setPage(pageIdx: number) {
    this._currentPage.next(pageIdx);
  }

  goToNextPage() {
    this._currentPage.next(this._currentPage.value + 1);
  }

  goToPreviousPage() {
    this._currentPage.next(this._currentPage.value - 1);
  }

  goToFirstPage() {
    this._currentPage.next(0);
  }

  goToLastPage() {
    this._currentPage.next(this._totalPages.value - 1);
  }

  setTotalPages(totalPages: number) {
    this._totalPages.next(totalPages);
  }
}
