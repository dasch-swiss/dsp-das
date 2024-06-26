import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { MediaControlService, SegmentsService } from '@dasch-swiss/vre/shared/app-segment-support';
import { PointerValue } from '../av-timeline/av-timeline.component';
import { FileRepresentation } from '../file-representation';
import { MovingImageSidecar } from '../moving-image-sidecar';
import { RepresentationService } from '../representation.service';
import { VideoPlayerService } from './video-player.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  providers: [MediaControlService, VideoPlayerService],
})
export class VideoComponent implements OnInit, OnChanges {
  @Input({ required: true }) src!: FileRepresentation;
  @Input({ required: true }) parentResource!: ReadResource;
  @Output() loaded = new EventEmitter<boolean>();

  @ViewChild('videoEle') videoEle!: ElementRef;
  @ViewChild('timeline') timeline!: ElementRef;
  @ViewChild('progress') progress!: ElementRef;
  @ViewChild('preview') preview!: ElementRef;

  start = 0;

  // video file url
  video?: SafeUrl;

  videoError?: string;

  // preview image information
  readonly frameWidth = 160;
  readonly halfFrameWidth: number = Math.round(this.frameWidth / 2);

  // size of progress bar / timeline
  timelineDimension?: DOMRect;

  duration = 0;
  currentTime: number = this.start;
  previewTime = 0;

  play = false;
  reachedTheEnd = false;

  readonly volume = 0.75;

  cinemaMode = false;

  watchForPause: number | null = null;
  isPlayerReady = false;
  fileInfo?: MovingImageSidecar;

  constructor(
    private _sanitizer: DomSanitizer,
    public _mediaControl: MediaControlService,
    private _notification: NotificationService,
    public segmentsService: SegmentsService,
    public videoPlayer: VideoPlayerService,
    private _rs: RepresentationService
  ) {}

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.cinemaMode) {
      this.cinemaMode = false;
    }
  }

  ngOnInit() {
    this._watchForMediaEvents();
  }

  onVideoPlayerReady() {
    const player = document.getElementById('video') as HTMLVideoElement;
    this.videoPlayer.onInit(player);
    this.isPlayerReady = true;
    this.loaded.emit(true);
  }

  ngOnChanges(): void {
    this.segmentsService.onInit(this.parentResource.id, 'VideoSegment');

    this.videoError = '';

    this.video = this._sanitizer.bypassSecurityTrustUrl(this.src.fileValue.fileUrl);
    // set the file info first bc. browsers might queue and block requests
    // if there are already six ongoing requests
    this._rs.getFileInfo(this.src.fileValue.fileUrl).subscribe(file => {
      this.fileInfo = file as MovingImageSidecar;
    });
  }

  private _watchForMediaEvents() {
    this._mediaControl.play$.subscribe(seconds => {
      if (seconds >= this.duration) {
        this._notification.openSnackBar('The video cannot be played at this time.');
        return;
      }
      this.videoPlayer.navigate(seconds);
      this.videoPlayer.play();
    });

    this._mediaControl.watchForPause$.subscribe(seconds => {
      this.watchForPause = seconds;
    });
  }

  timeUpdate() {
    // current time
    this.currentTime = this.videoEle.nativeElement.currentTime;

    let range = 0;
    const bf = this.videoEle.nativeElement.buffered;

    while (!(bf.start(range) <= this.currentTime && this.currentTime <= bf.end(range))) {
      range += 1;
    }

    if (this.watchForPause !== null && this.watchForPause === Math.floor(this.currentTime)) {
      this.videoPlayer.pause();
      this.watchForPause = null;
      return;
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
}
