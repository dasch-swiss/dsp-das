import { Component, EventEmitter, Input, Output, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TooltipPosition } from '@angular/material/tooltip';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/shared/app-config';
import { CreateSegmentDialogComponent, CreateSegmentDialogProps } from '@dasch-swiss/vre/shared/app-segment-support';
import { FileRepresentation } from '../file-representation';
import { MovingImageSidecar } from '../moving-image-sidecar';
import { VideoPlayerService } from './video-player.service';

@Component({
  selector: 'app-video-toolbar',
  template: ` <mat-toolbar-row style="background: black; color: white; justify-content: space-between">
    <div>
      <button
        mat-icon-button
        (click)="videoPlayer.togglePlay()"
        [matTooltip]="play ? 'Pause' : 'Play'"
        [matTooltipPosition]="matTooltipPos">
        <mat-icon>{{ videoPlayer.isPaused() ? 'play_arrow' : 'pause' }}</mat-icon>
      </button>

      <button
        mat-icon-button
        (click)="goToStart()"
        matTooltip="Stop and go to start"
        [matTooltipPosition]="matTooltipPos">
        <mat-icon>skip_previous</mat-icon>
      </button>
      <!-- TODO reached the end button "replay" -->
    </div>

    <div>{{ videoPlayer.currentTime() | appTime }} / {{ videoPlayer.duration() | appTime }}</div>

    <div>
      <app-video-more-button [resource]="parentResource" [src]="src" [fileInfo]="fileInfo" />

      <button mat-icon-button (click)="createVideoSegment()" [matTooltip]="'Create a segment'">
        <mat-icon>view_timeline</mat-icon>
      </button>

      <button
        mat-icon-button
        (click)="toggleCinemaMode()"
        [matTooltip]="cinemaMode ? 'Default view' : 'Cinema mode'"
        [matTooltipPosition]="matTooltipPos">
        <mat-icon>{{ cinemaMode ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
      </button>
    </div>
  </mat-toolbar-row>`,
})
export class VideoToolbarComponent {
  @Input({ required: true }) src!: FileRepresentation;
  @Input({ required: true }) parentResource!: ReadResource;
  @Input({ required: true }) fileInfo!: MovingImageSidecar;
  @Input({ required: true }) cinemaMode!: boolean;

  @Output() cinemaModeChange = new EventEmitter<boolean>();

  matTooltipPos: TooltipPosition = 'below';
  play = false;

  currentTime = 0;
  duration = 15;

  constructor(
    private _viewContainerRef: ViewContainerRef,
    private _dialog: MatDialog,
    public videoPlayer: VideoPlayerService
  ) {}

  createVideoSegment() {
    this._dialog.open<CreateSegmentDialogComponent, CreateSegmentDialogProps>(CreateSegmentDialogComponent, {
      ...DspDialogConfig.dialogDrawerConfig({
        type: 'VideoSegment',
        resource: this.parentResource,
        videoDurationSecs: this.duration,
      }),
      viewContainerRef: this._viewContainerRef,
    });
  }

  toggleCinemaMode() {
    this.cinemaModeChange.emit(!this.cinemaMode);
  }

  goToStart() {
    this.videoPlayer.navigate(0);
  }
}
