import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class MediaControlService {
  private _playSubject = new Subject<number>();
  play$ = this._playSubject.asObservable();

  mediaDurationSecs?: number;

  playMedia(seconds: number) {
    this._playSubject.next(seconds);
  }
}
