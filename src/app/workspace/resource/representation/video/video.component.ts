import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PointerValue } from '../av-timeline/av-timeline.component';
import { FileRepresentation } from '../file-representation';

// --> TODO will be replaced resp. removed
export interface Video {
    'name': string;
    'duration': number;
    'description'?: string;
}

@Component({
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {

    @Input() src: FileRepresentation;

    @Input() resourceIri?: string;

    @Input() project?: string;

    @Input() name?: string;

    @Input() start?= 0;


    @ViewChild('videoEle') videoEle: ElementRef;

    @ViewChild('timeline') timeline: ElementRef;

    @ViewChild('progress') progress: ElementRef;

    @ViewChild('preview') preview: ElementRef;

    loading = true;

    video: SafeUrl;

    // video information
    aspectRatio: number;

    // preview image information
    frameWidth = 160;
    halfFrameWidth: number = Math.round(this.frameWidth / 2);
    frameHeight: number;
    lastFrameNr: number;

    // preview images are organised in matrix files; we'll need the last number of those files
    matrixWidth: number = Math.round(this.frameWidth * 6);
    matrixHeight: number;
    lastMatrixNr: number;
    lastMatrixLine: number;

    // size of progress bar / timeline
    progressBarWidth: number;

    // time information
    duration: number;
    currentTime: number = this.start;
    previewTime = 0;

    // seconds per pixel to calculate preview image on timeline
    secondsPerPixel: number;

    // percent of video loaded
    currentBuffer: number;

    // status
    play = false;

    // volume
    volume = .75;
    muted = false;

    // video player mode
    cinemaMode = false;

    // matTooltipPosition
    matTooltipPos = 'above';

    constructor(
        private _sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        this.video = this._sanitizer.bypassSecurityTrustUrl(this.src.fileValue.fileUrl);
    }

    /**
     * stop playing and go back to start
     */
    goToStart() {
        this.videoEle.nativeElement.pause();
        this.play = false;
        this.currentTime = 0;
        this.videoEle.nativeElement.currentTime = this.currentTime;
    }

    /**
     * toggle play / pause
     */
    togglePlay() {

        this.play = !this.play;

        if (this.play) {
            this.videoEle.nativeElement.play();
        } else {
            this.videoEle.nativeElement.pause();
        }

    }

    /**
     * toggle player size between cinema (big) and normal mode
     */
    toggleCinemaMode() {
        this.cinemaMode = !this.cinemaMode;
    }


    /**
     * update current time info and buffer size
     * @param ev Event
     */
    timeUpdate(ev: Event) {
        // current time
        this.currentTime = this.videoEle.nativeElement.currentTime;

        // buffer progress
        this.currentBuffer = (this.videoEle.nativeElement.buffered.end(0) / this.duration) * 100;

        let range = 0;
        const bf = this.videoEle.nativeElement.buffered;

        while (!(bf.start(range) <= this.currentTime && this.currentTime <= bf.end(range))) {
            range += 1;
        }
        // --> TODO: bring back this information
        // const loadStartPercentage = (bf.start(range) / this.duration) * 100;
        // const loadEndPercentage = (bf.end(range) / this.duration) * 100;
        // let loadPercentage = (loadEndPercentage - loadStartPercentage);

        // console.log(loadPercentage);
        // console.log('position', (this.currentTime / this.secondsPerPixel))

        // this.updatePosition(Math.round(this.currentTime / this.secondsPerPixel));

    }

    /**
     * as soon as video has status "loadedmetadata" we're able to read
     * information about duration, video size and set volume
     *
     * @param ev Event
     */
    loadedMetadata(ev: Event) {
        // get video duration
        this.duration = this.videoEle.nativeElement.duration;
        // this.video = {
        //     name: this.name,
        //     duration: this.duration
        // };

        // calculate aspect ratio and set preview image size
        // this.aspectRatio = this.videoEle.nativeElement.videoWidth / this.videoEle.nativeElement.videoHeight;

        // this.frameHeight = Math.round(this.frameWidth / this.aspectRatio);
        // this.preview.nativeElement.style['width'] = this.frameWidth + 'px';
        // this.preview.nativeElement.style['height'] = this.frameHeight + 'px';

        // get last frame and matrix number and last matrix line
        // this.lastMatrixNr = Math.floor((this.duration - 30) / 360);
        // this.lastFrameNr = Math.round((this.duration - 9) / 10);
        // this.lastMatrixLine = Math.ceil((this.lastFrameNr - (this.lastMatrixNr * 36)) / 6);

        // set default volume
        this.videoEle.nativeElement.volume = this.volume;

    }

    loadedVideo() {
        this.loading = false;
        this.play = !this.videoEle.nativeElement.paused;
        this.displayPreview(false);
    }

    /**
     * video navigation from button (-/+ 10 sec)
     *
     * @param range positive or negative number value
     */
    updateTimeFromButton(range: number) {
        this._navigate(this.currentTime + range);
    }
    /**
     * video naviagtion from timeline / progress bar
     *
     * @param ev MatSliderChange
     */
    updateTimeFromSlider(time: number) {
        this._navigate(time);
    }
    /**
     * video navigation from scroll event
     *
     * @param ev WheelEvent
     */
    updateTimeFromScroll(ev: WheelEvent) {
        ev.preventDefault();
        this._navigate(this.currentTime + (ev.deltaY / 25));
    }


    mouseMove(ev: MouseEvent) {
        this._calcPreviewTime(ev);
    }


    sliderChange(ev: Event) {
        // console.log(ev);
        // const valueSeeked: number = parseInt(ev.target.value);

        // if (this.previewTime === valueSeeked) {
        //     console.log('preview time and slider value are correct')
        // } else {

        //     console.log('time: ', this.previewTime + ' === ' + valueSeeked + ' : ' + (this.previewTime === valueSeeked))
        // }


    }

    /**
     * show preview image during "mousemove" on progress bar / timeline
     *
     * @param  ev PointerValue
     */
    updatePreview(ev: PointerValue) {

        this.displayPreview(true);

        this.previewTime = Math.round(ev.time);

        // position from left:
        let leftPosition: number = ev.position - this.halfFrameWidth;

        if (this.cinemaMode) {
            // ev.screenX
            // prevent overflow of preview image on the left
            if (leftPosition <= 8) {
                leftPosition = 8;
            }
            // prevent overflow of preview image on the right
            if (leftPosition >= (this.progressBarWidth - this.frameWidth + 32)) {
                leftPosition = this.progressBarWidth - this.frameWidth + 32;
            }
        } else {
            // prevent overflow of preview image on the left
            if (leftPosition <= (this.halfFrameWidth)) {
                leftPosition = this.halfFrameWidth;
            }
            // prevent overflow of preview image on the right
            if (leftPosition >= (this.progressBarWidth - this.halfFrameWidth + 48)) {
                leftPosition = this.progressBarWidth - this.halfFrameWidth + 48;
            }
        }

        // set preview positon on x axis
        this.preview.nativeElement.style.left = leftPosition + 'px';

    }

    /**
     * show preview image or hide it
     *
     * @param status 'block' or 'none'
     */
    displayPreview(status: boolean) {

        const display = (status ? 'block' : 'none');

        // get size of progress bar / timeline to calculate seconds per pixel
        // this.progressBarWidth = this.progress.nativeElement.offsetWidth;
        // console.log('progressBarWidth', this.progressBarWidth);
        // this.secondsPerPixel = this.duration / this.progressBarWidth;


        // display preview or hide it; depending on mouse event "enter" or "leave" on progress bar / timeline
        // --> TODO: reactivate here again after testing video-preview size
        this.preview.nativeElement.style.display = display;
    }

    /**
     * general video navigation: Update current video time from position
     *
     * @param position Pixelnumber
     */
    private _navigate(position: number) {
        this.videoEle.nativeElement.currentTime = position;
    }

    private _calcPreviewTime(ev: MouseEvent) {
        this.previewTime = Math.round((ev.offsetX / this.timeline.nativeElement.clientWidth) * this.duration);
        this.previewTime = this.previewTime > this.duration ? this.duration : this.previewTime;
        this.previewTime = this.previewTime < 0 ? 0 : this.previewTime;
    }

}
