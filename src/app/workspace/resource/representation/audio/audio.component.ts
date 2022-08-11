import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
    ApiResponseError,
    Constants,
    KnoraApiConnection,
    ReadAudioFileValue,
    ReadResource,
    UpdateFileValue,
    UpdateResource,
    UpdateValue,
    WriteValueResponse
} from '@dasch-swiss/dsp-js';
import { mergeMap } from 'rxjs/operators';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { ErrorHandlerService } from 'src/app/main/services/error-handler.service';
import { EmitEvent, Events, UpdatedFileEventValue, ValueOperationEventService } from '../../services/value-operation-event.service';
import { FileRepresentation } from '../file-representation';
import { RepresentationService } from '../representation.service';

@Component({
    selector: 'app-audio',
    templateUrl: './audio.component.html',
    styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit, AfterViewInit {

    @Input() src: FileRepresentation;

    @Input() parentResource: ReadResource;

    @Output() loaded = new EventEmitter<boolean>();

    failedToLoad = false;
    currentTime = 0;
    audio: SafeUrl;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _sanitizer: DomSanitizer,
        private _dialog: MatDialog,
        private _errorHandler: ErrorHandlerService,
        private _rs: RepresentationService,
        private _valueOperationEventService: ValueOperationEventService,
        private readonly _http: HttpClient
    ) { }

    ngOnInit(): void {
        this.audio = this._sanitizer.bypassSecurityTrustUrl(this.src.fileValue.fileUrl);
        this.failedToLoad = !this._rs.doesFileExist(this.src.fileValue.fileUrl);
        let player = document.getElementById('audio') as HTMLAudioElement;
        player.addEventListener('timeupdate', () => {this.currentTime = player.currentTime});
    }

    ngAfterViewInit() {
        this.loaded.emit(true);
    }
    togglePlay(){
        let player = document.getElementById('audio') as HTMLAudioElement;
        if (player.paused){
            player.play();
        } else {
            player.pause();
        }
        
    }
    isPaused(){
        let player = document.getElementById('audio') as HTMLAudioElement;
        return player.paused;
    }
    parseTime(time){
        const minutes = Math.floor(time/60);
        const seconds = Math.floor(time - minutes*60);
        let minutesString = minutes.toString();
        if (minutes < 10){
            minutesString = "0" + minutesString;
        }
        let secondsString = seconds.toString();
        if (seconds < 10){
            secondsString = "0" + secondsString;
        }
        return minutesString + ":" + secondsString;
    }
    openReplaceFileDialog(){
        const propId = this.parentResource.properties[Constants.HasAudioFileValue][0].id;

        const dialogConfig: MatDialogConfig = {
            width: '800px',
            maxHeight: '80vh',
            position: {
                top: '112px'
            },
            data: { mode: 'replaceFile', title: 'Audio', subtitle: 'Update the audio file of this resource' , representation: 'audio', id: propId },
            disableClose: true
        };
        const dialogRef = this._dialog.open(
            DialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe((data) => {
            if (data) {
                this._replaceFile(data);
            }
        });
    }
    openIIIFnewTab(){
        window.open(this.src.fileValue.fileUrl, "_blank");
    }
     // https://stackoverflow.com/questions/66986983/angular-10-download-file-from-firebase-link-without-opening-into-new-tab
    async downloadAudio(url: string){
        try {
            const res = await this._http.get(url, { responseType: 'blob' }).toPromise();
            this.downloadFile(res);
        } catch (e) {
            this._errorHandler.showMessage(e);
        }
    }
    downloadFile(data){
        const url = window.URL.createObjectURL(data);
        const e = document.createElement('a');
        e.href = url;

        // set filename
        e.download = url.substr(url.lastIndexOf('/') + 1);

        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);
    }
    onSliderChangeEnd(event){
        let player = document.getElementById('audio') as HTMLAudioElement;
        player.currentTime = event.value;
    }
    getDuration(){
        let player = document.getElementById('audio') as HTMLAudioElement;
        return player.duration;
    }
    toggleMute(){
        let player = document.getElementById('audio') as HTMLAudioElement;
        player.muted = !player.muted;
    }
    isMuted(){
        let player = document.getElementById('audio') as HTMLAudioElement;
        return player.muted;
    }
    private _replaceFile(file: UpdateFileValue) {
        const updateRes = new UpdateResource();
        updateRes.id = this.parentResource.id;
        updateRes.type = this.parentResource.type;
        updateRes.property = Constants.HasAudioFileValue;
        updateRes.value = file;

        this._dspApiConnection.v2.values.updateValue(updateRes as UpdateResource<UpdateValue>).pipe(
            mergeMap((res: WriteValueResponse) => this._dspApiConnection.v2.values.getValue(this.parentResource.id, res.uuid))
        ).subscribe(
            (res2: ReadResource) => {

                this.src.fileValue.fileUrl = (res2.properties[Constants.HasAudioFileValue][0] as ReadAudioFileValue).fileUrl;
                this.src.fileValue.filename = (res2.properties[Constants.HasAudioFileValue][0] as ReadAudioFileValue).filename;
                this.src.fileValue.strval = (res2.properties[Constants.HasAudioFileValue][0] as ReadAudioFileValue).strval;
                this.src.fileValue.valueCreationDate = (res2.properties[Constants.HasAudioFileValue][0] as ReadAudioFileValue).valueCreationDate;

                this.audio = this._sanitizer.bypassSecurityTrustUrl(this.src.fileValue.fileUrl);

                this._valueOperationEventService.emit(
                    new EmitEvent(Events.FileValueUpdated, new UpdatedFileEventValue(
                        res2.properties[Constants.HasAudioFileValue][0])));

                const audioElem = document.getElementById('audio');
                (audioElem as HTMLAudioElement).load();

            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );
    }

}
