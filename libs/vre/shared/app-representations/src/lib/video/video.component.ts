import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/shared/app-config';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import {
  CreateSegmentDialogComponent,
  CreateSegmentDialogProps,
  SegmentsService,
} from '@dasch-swiss/vre/shared/app-segment-support';
import { PointerValue } from '../av-timeline/av-timeline.component';
import { FileRepresentation } from '../file-representation';
import { MediaControlService } from '../media-control.service';
import { MovingImageSidecar } from '../moving-image-sidecar';
import { RepresentationService } from '../representation.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  providers: [MediaControlService],
})
export class VideoComponent implements OnInit, OnChanges, AfterViewInit {
  @Input({ required: true }) src!: FileRepresentation;
  @Input({ required: true }) parentResource!: ReadResource;
  @Output() loaded = new EventEmitter<boolean>();

  @ViewChild('videoEle') videoEle!: ElementRef;
  @ViewChild('timeline') timeline!: ElementRef;
  @ViewChild('progress') progress!: ElementRef;
  @ViewChild('preview') preview!: ElementRef;

  start = 0;
  fileInfo?: MovingImageSidecar;

  // video file url
  video?: SafeUrl;

  videoError?: string;

  // preview image information
  readonly frameWidth = 160;
  readonly halfFrameWidth: number = Math.round(this.frameWidth / 2);

  // size of progress bar / timeline
  timelineDimension?: DOMRect;

  // time information
  duration = 0;
  currentTime: number = this.start;
  previewTime = 0;

  // status
  play = false;
  reachedTheEnd = false;

  // volume
  readonly volume = 0.75;

  // video player mode
  cinemaMode = false;

  // matTooltipPosition
  matTooltipPos = 'below';

  readonly timeScrollStep = 25;

  constructor(
    private _sanitizer: DomSanitizer,
    private _dialog: MatDialog,
    public _mediaControl: MediaControlService,
    private _notification: NotificationService,
    public segmentsService: SegmentsService,
    private _rs: RepresentationService,
    private _viewContainerRef: ViewContainerRef
  ) {}

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.cinemaMode) {
      this.cinemaMode = false;
    }
  }

  ngOnInit() {
    this._mediaControl.play$.subscribe(seconds => {
      if (seconds >= this.duration) {
        this._notification.openSnackBar('The video cannot be played at this time.');
        return;
      }
      this._navigate(seconds);
      this.playVideo();
    });
  }

  ngOnChanges(): void {
    this.segmentsService.onInit(this.parentResource.id);

    this.videoError = '';
    // set the file info first bc. browsers might queue and block requests
    // if there are already six ongoing requests
    this._rs.getFileInfo(this.src.fileValue.fileUrl).subscribe(file => {
      this.fileInfo = file as MovingImageSidecar;
    });

    this.video = this._sanitizer.bypassSecurityTrustUrl(this.src.fileValue.fileUrl);
  }

  ngAfterViewInit() {
    this.loaded.emit(true);
  }

  /**
   * stop playing and go back to start
   */
  goToStart() {
    this.pauseVideo();
    this.play = false;
    this.currentTime = 0;
    this.videoEle.nativeElement.currentTime = this.currentTime;
  }

  togglePlay() {
    this.play = !this.play;

    if (!this.videoEle) {
      return;
    }

    if (this.play) {
      this.playVideo();
    } else {
      this.pauseVideo();
    }
  }

  playVideo() {
    this.videoEle.nativeElement.play();
  }

  pauseVideo() {
    this.videoEle.nativeElement.pause();
  }

  toggleCinemaMode() {
    this.cinemaMode = !this.cinemaMode;
  }

  timeUpdate() {
    // current time
    this.currentTime = this.videoEle.nativeElement.currentTime;

    let range = 0;
    const bf = this.videoEle.nativeElement.buffered;

    while (!(bf.start(range) <= this.currentTime && this.currentTime <= bf.end(range))) {
      range += 1;
    }

    if (this.currentTime === this.duration && this.play) {
      this.play = false;
      this.reachedTheEnd = true;
    } else {
      this.reachedTheEnd = false;
    }
  }

  loadedMetadata() {
    // get video duration
    this.duration = Math.floor(this.videoEle.nativeElement.duration);
    this._mediaControl.mediaDurationSecs = this.duration;

    // set default volume
    this.videoEle.nativeElement.volume = this.volume;

    // load preview file
    this.displayPreview(true);
  }

  loadedVideo() {
    this.play = !this.videoEle.nativeElement.paused;
  }

  /**
   * video navigation from button (-/+ 10 sec)
   *
   * @param range positive or negative number value
   */
  updateTimeFromButton(range: number) {
    if (range > 0 && this.currentTime > this.duration - 10) {
      this._navigate(this.duration);
    } else if (range < 0 && this.currentTime < 10) {
      this._navigate(0);
    } else {
      this._navigate(this.currentTime + range);
    }
  }

  updateTimeFromSlider(time: number) {
    this._navigate(time);
  }

  updateTimeFromScroll(ev: WheelEvent) {
    ev.preventDefault();
    this._navigate(this.currentTime + ev.deltaY / this.timeScrollStep);
  }

  updatePreview(ev: PointerValue) {
    if (!this.timelineDimension) {
      return;
    }
    this.displayPreview(true);

    this.previewTime = Math.round(ev.time);

    // position from left:
    let leftPosition: number = ev.position - this.timelineDimension.x - this.halfFrameWidth;

    // prevent overflow of preview image on the left
    if (leftPosition <= 8) {
      leftPosition = 8;
    }

    // prevent overflow of preview image on the right
    if (leftPosition >= this.timelineDimension.width - this.frameWidth + 8) {
      leftPosition = this.timelineDimension.width - this.frameWidth + 8;
    }

    // set preview positon on x axis
    this.preview.nativeElement.style.left = `${leftPosition}px`;
  }

  displayPreview(status: boolean) {
    this.preview.nativeElement.style.display = status ? 'block' : 'none';
  }

  createVideoSegment() {
    this._dialog.open<CreateSegmentDialogComponent, CreateSegmentDialogProps>(CreateSegmentDialogComponent, {
      ...DspDialogConfig.dialogDrawerConfig({ resource: this.parentResource, videoDurationSecs: this.duration }),
      viewContainerRef: this._viewContainerRef,
    });
  }

  handleVideoError(event: ErrorEvent) {
    const videoElement = event.target as HTMLMediaElement;
    console.error('Video error:', videoElement.error);

    if (videoElement.error) {
      let vErr: string;
      switch (videoElement.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          vErr = 'Video playback aborted.';
          console.error(vErr);
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          vErr = 'Network error occurred while loading the video.';
          console.error(vErr);
          break;
        case MediaError.MEDIA_ERR_DECODE:
          vErr = 'Video decoding error.';
          console.error(vErr);
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          vErr = 'The video format is not supported.';
          console.error(vErr);
          break;
        default:
          vErr = 'An unknown video error occurred.';
          console.error(vErr);
          break;
      }
      this.videoError = vErr;
    }
  }

  private _navigate(position: number) {
    this.videoEle.nativeElement.currentTime = position;
  }
}
