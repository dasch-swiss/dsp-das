import { AfterViewInit, Component, EventEmitter, Inject, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
  Constants,
  KnoraApiConnection,
  ReadAudioFileValue,
  ReadResource,
  UpdateFileValue,
  UpdateResource,
  UpdateValue,
  WriteValueResponse,
} from '@dasch-swiss/dsp-js';
import { ResourceUtil } from '@dasch-swiss/vre/shared/app-common';
import { DialogComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { DspApiConnectionToken, DspDialogConfig } from '@dasch-swiss/vre/shared/app-config';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import {
  CreateSegmentDialogComponent,
  CreateSegmentDialogProps,
  MediaControlService,
  SegmentsService,
} from '@dasch-swiss/vre/shared/app-segment-support';
import { mergeMap } from 'rxjs/operators';
import { FileRepresentation } from '../file-representation';
import { RepresentationService } from '../representation.service';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
  providers: [MediaControlService],
})
export class AudioComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) src!: FileRepresentation;

  @Input({ required: true }) parentResource!: ReadResource;

  @Output() loaded = new EventEmitter<boolean>();

  originalFilename: string;
  failedToLoad = false;
  currentTime = 0;
  audio: SafeUrl;

  duration = 0;
  watchForPause?: number;

  get usercanEdit() {
    return ResourceUtil.userCanEdit(this.parentResource);
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _sanitizer: DomSanitizer,
    private _dialog: MatDialog,
    private _rs: RepresentationService,
    public segmentsService: SegmentsService,
    private _viewContainerRef: ViewContainerRef,
    private _mediaControl: MediaControlService,
    private _notification: NotificationService
  ) {}

  ngOnInit(): void {
    this._watchForMediaEvents();

    this._rs.getFileInfo(this.src.fileValue.fileUrl).subscribe(
      res => {
        this.originalFilename = res['originalFilename'];
      },
      () => {
        this.failedToLoad = true;
      }
    );
    this.audio = this._sanitizer.bypassSecurityTrustUrl(this.src.fileValue.fileUrl);

    this.loaded.subscribe(value => {
      if (value) {
        setTimeout(() => {
          this.duration = this.getDuration();
        }, 5000);
      }
    });

    this.segmentsService.onInit(this.parentResource.id, 'AudioSegment');
  }

  ngAfterViewInit() {
    this.loaded.emit(true);
  }

  onTimeUpdate(event: { target: HTMLAudioElement }) {
    this.currentTime = event.target.currentTime;
  }

  togglePlay() {
    if (this.isPaused()) {
      this.play();
    } else {
      this.pause();
    }
  }

  play() {
    (document.getElementById('audio') as HTMLAudioElement).play();
  }

  pause() {
    (document.getElementById('audio') as HTMLAudioElement).pause();
  }

  private _watchForMediaEvents() {
    this._mediaControl.play$.subscribe(seconds => {
      if (seconds >= this.duration) {
        this._notification.openSnackBar('The video cannot be played at this time.');
        return;
      }
      this._navigate(seconds);
      this.play();
    });

    this._mediaControl.watchForPause$.subscribe(seconds => {
      this.watchForPause = seconds;
    });
  }

  isPaused() {
    const player = document.getElementById('audio') as HTMLAudioElement;
    return player.paused;
  }

  parseTime(time) {
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

  openReplaceFileDialog() {
    const propId = this.parentResource.properties[Constants.HasAudioFileValue][0].id;

    const dialogConfig: MatDialogConfig = {
      width: '800px',
      maxHeight: '80vh',
      position: {
        top: '112px',
      },
      data: {
        mode: 'replaceFile',
        title: 'Audio',
        subtitle: 'Update the audio file of this resource',
        representation: 'audio',
        id: propId,
      },
      disableClose: true,
    };
    const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this._replaceFile(data);
      }
    });
  }

  openIIIFnewTab() {
    window.open(this.src.fileValue.fileUrl, '_blank');
  }

  download(url: string) {
    this._rs.downloadFile(url);
  }

  onSliderChangeEnd(event) {
    const player = document.getElementById('audio') as HTMLAudioElement;
    player.currentTime = event.value;
  }

  getDuration() {
    const player = document.getElementById('audio') as HTMLAudioElement;
    console.log(player, player.duration);
    return player.duration;
  }

  toggleMute() {
    const player = document.getElementById('audio') as HTMLAudioElement;
    player.muted = !player.muted;
  }

  isMuted() {
    const player = document.getElementById('audio') as HTMLAudioElement;
    return player.muted;
  }

  createAudioSegment() {
    this._dialog.open<CreateSegmentDialogComponent, CreateSegmentDialogProps>(CreateSegmentDialogComponent, {
      ...DspDialogConfig.dialogDrawerConfig({
        type: 'AudioSegment',
        resource: this.parentResource,
        videoDurationSecs: this.duration,
      }),
      viewContainerRef: this._viewContainerRef,
    });
  }

  private _replaceFile(file: UpdateFileValue) {
    const updateRes = new UpdateResource();
    updateRes.id = this.parentResource.id;
    updateRes.type = this.parentResource.type;
    updateRes.property = Constants.HasAudioFileValue;
    updateRes.value = file;

    this._dspApiConnection.v2.values
      .updateValue(updateRes as UpdateResource<UpdateValue>)
      .pipe(
        mergeMap((res: WriteValueResponse) =>
          this._dspApiConnection.v2.values.getValue(this.parentResource.id, res.uuid)
        )
      )
      .subscribe((res2: ReadResource) => {
        this.src.fileValue.fileUrl = (res2.properties[Constants.HasAudioFileValue][0] as ReadAudioFileValue).fileUrl;
        this.src.fileValue.filename = (res2.properties[Constants.HasAudioFileValue][0] as ReadAudioFileValue).filename;
        this.src.fileValue.strval = (res2.properties[Constants.HasAudioFileValue][0] as ReadAudioFileValue).strval;
        this.src.fileValue.valueCreationDate = (
          res2.properties[Constants.HasAudioFileValue][0] as ReadAudioFileValue
        ).valueCreationDate;

        this.audio = this._sanitizer.bypassSecurityTrustUrl(this.src.fileValue.fileUrl);

        this._rs.getFileInfo(this.src.fileValue.fileUrl).subscribe(res => {
          this.originalFilename = res['originalFilename'];
        });

        const audioElem = document.getElementById('audio');
        (audioElem as HTMLAudioElement).load();
      });
  }

  private _navigate(position: number) {
    (document.getElementById('audio') as HTMLAudioElement).currentTime = position;
  }
}
