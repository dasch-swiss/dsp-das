import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class VideoPlayerService {
  private _videoPlayer!: HTMLVideoElement;

  onTimeUpdate$!: Observable<number>;

  onInit(player: HTMLVideoElement) {
    this._videoPlayer = player;
    this.onTimeUpdate$ = fromEvent<Event>(this._videoPlayer, 'timeupdate').pipe(
      map(v => (v.target as HTMLVideoElement).currentTime)
    );
  }

  togglePlay() {
    if (this.isPaused()) {
      this.play();
    } else {
      this.pause();
    }
  }

  isPaused() {
    return this._videoPlayer.paused;
  }

  play() {
    this._videoPlayer.play();
  }

  pause() {
    this._videoPlayer.pause();
  }

  duration() {
    return this._videoPlayer.duration;
  }

  playFromBeginning() {
    this.navigate(0);
  }

  toggleMute() {
    this._videoPlayer.muted = !this._videoPlayer.muted;
  }

  isMuted() {
    return this._videoPlayer.muted;
  }

  navigate(position: number) {
    this._videoPlayer.currentTime = position;
  }

  currentTime() {
    return this._videoPlayer.currentTime;
  }
}
