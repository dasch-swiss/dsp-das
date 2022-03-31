import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FileRepresentation } from '../../file-representation';

export interface MovingImageSidecar {
    '@context': string;
    'checksumDerivative': string;
    'checksumOriginal': string;
    'duration': number;
    'fileSize': number;
    'fps': number;
    'height': number;
    'id': string;
    'internalMimeType': string;
    'originalFilename': string;
    'width': number;
}

export interface Size {
    'width': number;
    'height': number;
}

export interface Profile {
    'formats': [string];
    'qualities': [string];
    'supports': [string];
}

export interface SipiImageInfo {
    '@context': string;
    '@id': string;
    'protocol': string;
    'width': number;
    'height': number;
    'sizes': [Size];
    'profile': (string | Profile)[];
}

@Component({
    selector: 'app-video-preview',
    templateUrl: './video-preview.component.html',
    styleUrls: ['./video-preview.component.scss'],
})
export class VideoPreviewComponent implements OnInit, OnChanges {

    @Input() dispTime = false;

    /** needed video information: name and duration */
    @Input() src: FileRepresentation;

    /** show frame at the corresponding time */
    @Input() time?: number;

    @Output() open = new EventEmitter<{ video: string; time: number }>();

    @Output() fileMetadata = new EventEmitter<MovingImageSidecar>();

    @ViewChild('frame') frame: ElementRef;


    fileInfo: MovingImageSidecar;

    focusOnPreview = false;

    // video information: aspect ration
    aspectRatio: number;

    // preview images are organized in matrix files;
    // we need the last number of those files and the number of lines from the last matrix file
    // we need the number of these files and the number of lines of the last matrix file
    // 1. matrix file name
    matrix: string;
    // 2. matrix dimension
    matrixWidth: number;
    matrixHeight: number;
    // 3. number of matrixes and number of lines of last file and number of last possible frame
    lastMatrixNr: number;
    lastMatrixLine: number;
    lastMatrixFrameNr: number;
    // 4. dimension of one frame inside the matrix
    matrixFrameWidth: number;
    matrixFrameHeight: number;

    // size of frame to be displayed; corresponds to dimension of parent container
    frameWidth: number;
    frameHeight: number;

    // proportion between matrix frame size and parent container size
    // to calculate matrix background size
    proportion: number;

    constructor(
        private _host: ElementRef,
        private _http: HttpClient
    ) { }

    @HostListener('mouseenter', ['$event']) onEnter(e: MouseEvent) {
        this.toggleFlipbook(true);
    }

    @HostListener('mouseleave', ['$event']) onLeave(e: MouseEvent) {
        this.toggleFlipbook(false);
    }

    @HostListener('mousemove', ['$event']) onMove(e: MouseEvent) {
        this.updatePreviewByPosition(e);
    }

    @HostListener('click', ['$event']) onClick(e: MouseEvent) {
        this.openVideo();
    }

    ngOnInit(): void {
        const requestOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true
        };

        const pathToJson = this.src.fileValue.fileUrl.substring(0, this.src.fileValue.fileUrl.lastIndexOf('/')) + '/knora.json';

        this._http.get(pathToJson, requestOptions).subscribe(
            (res: MovingImageSidecar) => {
                this.fileInfo = res;
                this.fileMetadata.emit(res);
            }
        );

    }

    ngOnChanges() {
        this.time = this.time || (this.fileInfo.duration / 2);

        if (this.frame.nativeElement) {
            this.updatePreviewByTime();
        }
        // get matrix url from video url
        // get base path from http://0.0.0.0:1024/1111/5AiQkeJNbQn-ClrXWkJVFvB.mp4/file
        // => http://0.0.0.0:1024/1111/5AiQkeJNbQn-ClrXWkJVFvB
        const basePath = this.src.fileValue.fileUrl.substring(0, this.src.fileValue.fileUrl.lastIndexOf('/')).replace(/\.[^/.]+$/, '');
        // and file name
        // => 5AiQkeJNbQn-ClrXWkJVFvB
        const fileName = basePath.substring(basePath.lastIndexOf('/') + 1);

        this.matrix = basePath + '/' + fileName + '_m_0.jpg/file';

        if (!this.matrixFrameWidth && !this.matrixFrameHeight) {
            this.calculateSizes(this.matrix, false);
        }
    }

    toggleFlipbook(active: boolean) {
        this.focusOnPreview = active;

        let i = 0;
        const j = 0;

        if (this.focusOnPreview) {
            // automatic playback of individual frames from first matrix
            // --> TODO: activate this later with an additional parameter (@Input) to switch between mousemove and automatic preview
            // this.autoPlay(i, j, false);

        } else {
            i = 0;
        }

    }

    autoPlay(i: number, j: number, sipi: boolean, delay: number = 250) {
        let iiifParams: string;
        let cssParams: string;
        let x = 0;
        let y = 0;

        setTimeout(() => {

            x = i * this.matrixFrameWidth;
            y = j * this.matrixFrameHeight;

            if (sipi) {
                iiifParams = x + ',' + y + ',' + this.matrixFrameWidth + ',' + this.matrixFrameHeight + '/' + this.frameWidth + ',' + this.frameHeight + '/0/default.jpg';
                const currentFrame: string = this.matrix + '/' + iiifParams;

                this.frame.nativeElement.style['background-image'] = 'url(' + currentFrame + ')';
            } else {
                cssParams = '-' + x + 'px -' + y + 'px';

                this.frame.nativeElement.style['background-position'] = cssParams;
            }

            i++;
            if (i < 6 && this.focusOnPreview) {
                this.autoPlay(i, j, sipi);
            } else {
                i = 0;
                j++;
                if (j < 6 && this.focusOnPreview) {
                    this.autoPlay(i, j, sipi);
                }
            }
        }, delay);
    }

    // to test the difference between sipi single image calculation and css background position,
    // this method has the additional parameter `sipi` as boolean value to switch between the two variants quite quick
    calculateSizes(image: string, sipi: boolean) {

        console.warn('load matrix file to get info');

        // host dimension
        const parentFrameWidth: number = this._host.nativeElement.offsetWidth;
        const parentFrameHeight: number = this._host.nativeElement.offsetHeight;

        this._getMatrixSize(image).subscribe(
            (dim: Size) => {

                // whole matrix dimension is:
                this.matrixWidth = dim.width;
                this.matrixHeight = dim.height;

                const lines: number = (this.fileInfo.duration > 360 ? 6 : Math.round(this.fileInfo.duration / 60));

                // get matrix frame dimension
                this.matrixFrameWidth = (this.matrixWidth / 6);
                this.matrixFrameHeight = (this.matrixHeight / lines);

                this.lastMatrixNr = Math.floor((this.fileInfo.duration - 10) / 360);

                this.proportion = (this.matrixFrameWidth / parentFrameWidth);

                if ((this.matrixFrameHeight / this.proportion) > parentFrameHeight) {
                    this.proportion = (this.matrixFrameHeight / parentFrameHeight);
                }

                this.frameWidth = Math.round(this.matrixFrameWidth / this.proportion);
                this.frameHeight = Math.round(this.matrixFrameHeight / this.proportion);

                if (sipi) {
                    // calculate iiifParams / position, cutout-size (matrixFrameDimension) / display-size
                    const iiifParams: string = '0,0,' + this.matrixFrameWidth + ',' + this.matrixFrameHeight + '/' + this.frameWidth + ',/0/default.jpg';
                    const currentFrame: string = image + '/' + iiifParams;
                    this.frame.nativeElement.style['background-image'] = 'url(' + currentFrame + ')';
                    this.frame.nativeElement.style['background-size'] = this.frameWidth + 'px ' + this.frameHeight + 'px';
                } else {
                    // background-image, -size
                    this.frame.nativeElement.style['background-image'] = 'url(' + this.matrix + ')';
                    this.frame.nativeElement.style['background-size'] = Math.round(this.matrixWidth / this.proportion) + 'px auto';
                }

                this.frame.nativeElement.style['width'] = this.frameWidth + 'px';
                this.frame.nativeElement.style['height'] = this.frameHeight + 'px';
            }
        );

    }

    updatePreviewByPosition(ev: MouseEvent) {

        const position: number = ev.offsetX;

        // one frame per 6 pixels
        if (Number.isInteger(position / 6)) {
            // calculate time from relative mouse position;
            this.time = (ev.offsetX / this._host.nativeElement.offsetWidth) * this.fileInfo.duration;

            this.updatePreviewByTime();
        }

    }

    updatePreviewByTime() {

        // overflow fixes
        if (this.time < 0) {
            this.time = 0;
        }
        if (this.time > this.fileInfo.duration) {
            this.time = this.fileInfo.duration;
        }

        // get current matrix image; one matrix contains 6 minute of the video
        let curMatrixNr: number = Math.floor(this.time / 360);

        if (curMatrixNr < 0) {
            curMatrixNr = 0;
        }

        // get current matrix file url; TODO: this will be handled by sipi

        // the last matrix file could have another dimension size...
        if (curMatrixNr < this.lastMatrixNr) {
            this.matrixHeight = Math.round(this.frameHeight * 6);
            this.frame.nativeElement.style['background-size'] = Math.round(this.matrixWidth / this.proportion) + 'px auto';
        } else {
            this.lastMatrixFrameNr = Math.floor((this.fileInfo.duration - 8) / 10);
            this.lastMatrixLine = Math.ceil((this.lastMatrixFrameNr - (this.lastMatrixNr * 36)) / 6) + 1;
            this.matrixHeight = Math.round(this.frameHeight * this.lastMatrixLine);
            this.frame.nativeElement.style['background-size'] = Math.round(this.matrixWidth / this.proportion) + 'px auto';
        }

        let curFrameNr: number = Math.floor(this.time / 10) - Math.floor(36 * curMatrixNr);

        if (curFrameNr < 0) {
            curFrameNr = 0;
        }
        if (curFrameNr > this.lastMatrixFrameNr) {
            curFrameNr = this.lastMatrixFrameNr;
        }

        // calculate current line and columne number in the matrix and get current frame / preview image position
        const curLineNr: number = Math.floor(curFrameNr / 6);
        const curColNr: number = Math.floor(curFrameNr - (curLineNr * 6));
        const cssParams: string = '-' + (curColNr * this.frameWidth) + 'px -' + (curLineNr * this.frameHeight) + 'px';

        this.frame.nativeElement.style['background-image'] = 'url(' + this.matrix + ')';


        this.frame.nativeElement.style['background-position'] = cssParams;

    }

    openVideo() {
        // used in preview only. Not sure if we have to keep it in DSP-APP
        // this.open.emit({ video: this.fileInfo.name, time: Math.round(this.time) });
    }

    private _getMatrixSize(matrix: string): Observable<Size> {
        const mapLoadedImage = (event): Size => ({
            width: event.target.width,
            height: event.target.height
        });

        const image = new Image();
        image.src = matrix;
        // console.log('image new', image);
        const $loadedImg = fromEvent(image, 'load').pipe(
            take(1),
            map(mapLoadedImage)
        );
        // console.log('loadedImg', $loadedImg);
        // console.log('image def', image);
        return $loadedImg;
    }

}
