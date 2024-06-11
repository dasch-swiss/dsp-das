import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MediaControlService {
  private _playSubject = new BehaviorSubject(false);
  play$ = this._playSubject.asObservable();

  playMedia(value: boolean) {
    this._playSubject.next(value);
  }
}
