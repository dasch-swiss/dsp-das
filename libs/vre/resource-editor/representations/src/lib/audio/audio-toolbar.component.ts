import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import {
  CreateSegmentDialogComponent,
  CreateSegmentDialogProps,
} from '@dasch-swiss/vre/resource-editor/segment-support';
import { ResourceFetcherService } from '../resource-fetcher.service';
import { MediaPlayerService } from '../video/media-player.service';

@Component({
  selector: 'app-audio-toolbar',
  template: `
    <mat-toolbar-row style="background: black; color: white; justify-content: space-between">
      <div>
        <button data-cy="play-pause-button" mat-icon-button (click)="mediaPlayer.togglePlay()">
          <mat-icon>{{ mediaPlayer.isPaused() ? 'play_arrow' : 'pause' }}</mat-icon>
        </button>
        <button data-cy="go-to-start-button" mat-icon-button (click)="mediaPlayer.navigateToStart()">
          <mat-icon>skip_previous</mat-icon>
        </button>
        <button data-cy="volume-button" mat-icon-button (click)="mediaPlayer.toggleMute()">
          <mat-icon>{{ mediaPlayer.isMuted() ? 'volume_off' : 'volume_up' }}</mat-icon>
        </button>
      </div>
      <div data-cy="player-time">{{ parseTime(mediaPlayer.currentTime()) }} / {{ durationString }}</div>
      <div>
        <button
          data-cy="timeline-button"
          mat-icon-button
          (click)="createAudioSegment()"
          *ngIf="resourceFetcherService.userCanEdit$ | async">
          <mat-icon svgIcon="draw_region_icon" />
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
    private _domSanitizer: DomSanitizer,
    private _matIconRegistry: MatIconRegistry,
    public mediaPlayer: MediaPlayerService,
    private _viewContainerRef: ViewContainerRef,
    public resourceFetcherService: ResourceFetcherService
  ) {}

  ngOnInit() {
    this._setupCssMaterialIcon();
    this.durationString = this.parseTime(this.mediaPlayer.duration());
  }

  createAudioSegment() {
    this._dialog.open<CreateSegmentDialogComponent, CreateSegmentDialogProps>(CreateSegmentDialogComponent, {
      ...DspDialogConfig.dialogDrawerConfig(
        {
          type: 'AudioSegment',
          resource: this.parentResource,
          videoDurationSecs: this.mediaPlayer.duration(),
        },
        true
      ),
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

  private _setupCssMaterialIcon() {
    this._matIconRegistry.addSvgIcon(
      'draw_region_icon',
      this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/draw-region-icon.svg')
    );
  }
}
