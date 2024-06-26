import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { MediaControlService, SegmentsService } from '@dasch-swiss/vre/shared/app-segment-support';
import { FileRepresentation } from '../file-representation';
import { RepresentationService } from '../representation.service';
import { AudioPlayerService } from './audio-player.service';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
  providers: [MediaControlService, AudioPlayerService],
})
export class AudioComponent implements OnInit {
  @Input({ required: true }) src!: FileRepresentation;

  @Input({ required: true }) parentResource!: ReadResource;

  @Output() loaded = new EventEmitter<boolean>();

  originalFilename?: string;
  failedToLoad = false;
  audioFileUrl!: SafeUrl;

  duration = 0;
  watchForPause?: number;

  isPlayerReady = false;

  constructor(
    private _sanitizer: DomSanitizer,
    public segmentsService: SegmentsService,
    private _mediaControl: MediaControlService,
    private _notification: NotificationService,
    public audioPlayer: AudioPlayerService,
    private _rs: RepresentationService
  ) {}

  ngOnInit(): void {
    this._watchForMediaEvents();
    this.audioFileUrl = this._sanitizer.bypassSecurityTrustUrl(this.src.fileValue.fileUrl);
    this.segmentsService.onInit(this.parentResource.id, 'AudioSegment');

    this._rs.getFileInfo(this.src.fileValue.fileUrl).subscribe(
      res => {
        this.originalFilename = res.originalFilename;
      },
      () => {
        this.failedToLoad = true;
      }
    );
  }

  onAudioPlayerReady() {
    const player = document.getElementById('audio') as HTMLAudioElement;
    this.audioPlayer.onInit(player);
    this.isPlayerReady = true;
    this.duration = this.audioPlayer.duration();
  }

  private _watchForMediaEvents() {
    this._mediaControl.play$.subscribe(seconds => {
      if (seconds >= this.duration) {
        this._notification.openSnackBar('The video cannot be played at this time.');
        return;
      }
      this.audioPlayer.navigate(seconds);
      this.audioPlayer.play();
    });

    this._mediaControl.watchForPause$.subscribe(seconds => {
      this.watchForPause = seconds;
    });
  }

  private _setPlayer() {}

  protected readonly Math = Math;
}
