import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/shared/app-config';
import { CreateSegmentDialogComponent, CreateSegmentDialogProps } from '@dasch-swiss/vre/shared/app-segment-support';
import { AudioPlayerService } from './audio-player.service';

@Component({
  selector: 'app-audio-toolbar',
  template: `
    <mat-toolbar-row style="background: black; color: white; justify-content: space-between">
      <div>
        <button mat-icon-button (click)="audioPlayer.togglePlay()">
          <mat-icon>{{ audioPlayer.isPaused() ? 'play_arrow' : 'pause' }}</mat-icon>
        </button>
        <button mat-icon-button (click)="audioPlayer.playFromBeginning()">
          <mat-icon>skip_previous</mat-icon>
        </button>
        <button mat-icon-button (click)="audioPlayer.toggleMute()">
          <mat-icon>{{ audioPlayer.isMuted() ? 'volume_off' : 'volume_up' }}</mat-icon>
        </button>
      </div>
      <div>{{ parseTime(audioPlayer.currentTime()) }} / {{ durationString }}</div>

      <div>
        <button mat-icon-button (click)="createAudioSegment()">
          <mat-icon>view_timeline</mat-icon>
        </button>
        <app-audio-more-button [parentResource]="parentResource" />
      </div>
    </mat-toolbar-row>
  `,
})
export class AudioToolbarComponent implements OnInit {
  @Input({ required: true }) parentResource!: ReadResource;

  durationString!: string;

  constructor(
    private _dialog: MatDialog,
    private _viewContainerRef: ViewContainerRef,
    public audioPlayer: AudioPlayerService
  ) {}

  ngOnInit() {
    this.durationString = this.parseTime(this.audioPlayer.duration());
  }

  createAudioSegment() {
    this._dialog.open<CreateSegmentDialogComponent, CreateSegmentDialogProps>(CreateSegmentDialogComponent, {
      ...DspDialogConfig.dialogDrawerConfig({
        type: 'AudioSegment',
        resource: this.parentResource,
        videoDurationSecs: this.audioPlayer.duration(),
      }),
      viewContainerRef: this._viewContainerRef,
    });
  }

  parseTime(time: any) {
    if (Number.isNaN(time)) {
      return '00:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);
    let minutesString = minutes.toString();
    if (minutes < 10) {
      minutesString = `0${minutesString}`;
    }
    let secondsString = seconds.toString();
    if (seconds < 10) {
      secondsString = `0${secondsString}`;
    }
    return `${minutesString}:${secondsString}`;
  }
}
