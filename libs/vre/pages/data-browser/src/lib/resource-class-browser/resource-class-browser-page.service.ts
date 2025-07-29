import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ResourceClassBrowserPageService {
  private _pageIndexSubject = new BehaviorSubject(0);
  pageIndex$ = this._pageIndexSubject.asObservable();

  updatePageIndex(newIndex: number): void {
    this._pageIndexSubject.next(newIndex);
  }
}
