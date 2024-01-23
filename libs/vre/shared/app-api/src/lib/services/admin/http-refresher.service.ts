import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, startWith, tap } from 'rxjs/operators';

export type RefresherType = 'PROJECT' | ' LIST';

@Injectable({
  providedIn: 'root',
})
export class HttpRefresher {
  private _behaviorSubject = new BehaviorSubject<RefresherType | null>(null);

  get(type: RefresherType) {
    return this._behaviorSubject.pipe(
      startWith(type),
      filter(value => value === type)
    );
  }

  update(type: RefresherType) {
    this._behaviorSubject.next(type);
  }
}
