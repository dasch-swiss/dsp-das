import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { ReadMovingImageFileValue } from '@dasch-swiss/dsp-js';
import { fromEvent, merge, Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { MovingImageSidecar } from '../moving-image-sidecar';

export interface Dimension {
  width: number;
  height: number;
}

@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.scss'],
})
export class VideoPreviewComponent implements OnChanges {
  @Input({ required: true }) src!: ReadMovingImageFileValue;

  @Input({ required: true }) time!: number;
  @Input() fileInfo?: MovingImageSidecar;
  @Output() loaded = new EventEmitter<boolean>();

  @ViewChild('frame') frame: ElementRef;

  focusOnPreview = false;

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
  lastMatrixFrameNr: number;
  // 4. dimension of one frame inside the matrix
  matrixFrameWidth: number;
  matrixFrameHeight: number;

  previewError = false;

  // size of frame to be displayed; corresponds to dimension of parent container
  frameWidth: number;
  frameHeight: number;

  // proportion between matrix frame size and parent container size
  // to calculate matrix background size
  proportion: number;

  constructor(private _host: ElementRef) {}

  @HostListener('mousemove', ['$event']) onMove(e: MouseEvent) {
    this.updatePreviewByPosition(e);
  }

  ngOnChanges() {
    this.time = this.time || 0;

    if (this.frame?.nativeElement && this.fileInfo) {
      this.updatePreviewByTime();
    }
  }

  /**
   * run frame by frame automatically; only in preview mode
   * @param i
   * @param j
   * @param [delay]
   */
  autoPlay(i: number, j: number, delay = 250) {
    let cssParams: string;
    let x = 0;
    let y = 0;

    setTimeout(() => {
      x = i * this.matrixFrameWidth;
      y = j * this.matrixFrameHeight;

      cssParams = `-${x}px -${y}px`;
      this.frame.nativeElement.style['background-position'] = cssParams;

      i++;
      if (i < 6 && this.focusOnPreview) {
        this.autoPlay(i, j);
      } else {
        i = 0;
        j++;
        if (j < 6 && this.focusOnPreview) {
          this.autoPlay(i, j);
        }
      }
    }, delay);
  }

  /**
   * calculates sizes of the preview frame;
   * - always depends on aspect ration of the video
   * - with of the matrix file is always the same (960px)
   * @param image
   * @param fileNumber
   */
  calculateSizes(image: string, fileNumber: number) {
    // host dimension
    const parentFrameWidth: number = this._host.nativeElement.offsetWidth;
    const parentFrameHeight: number = this._host.nativeElement.offsetHeight;

    this._getMatrixDimension(image).subscribe(
      (dim: Dimension) => {
        // we got a dimension. There's no error
        this.previewError = false;

        // whole matrix dimension is:
        this.matrixWidth = dim.width;
        this.matrixHeight = dim.height;

        let lines: number = this.fileInfo.duration > 360 ? 6 : Math.floor(this.fileInfo.duration / 60 + 1);
        lines = lines > 0 ? lines : 1;

        // last matrix file could have a different height than the previous ones
        // this means the number of lines could be different
        this.lastMatrixNr = Math.floor((this.fileInfo.duration - 10) / 360);
        if (this.lastMatrixNr === fileNumber) {
          // re-calc number of lines
          this.lastMatrixFrameNr = Math.floor((this.fileInfo.duration - 8) / 10 + 1);
          lines = Math.floor((this.lastMatrixFrameNr - this.lastMatrixNr * 36) / 6) + 1;
        }

        // get matrix frame dimension
        this.matrixFrameWidth = this.matrixWidth / 6;
        this.matrixFrameHeight = this.matrixHeight / lines;

        // set proportion between matrix frame width and the container where the preview frame has to be displayed
        this.proportion = this.matrixFrameWidth / parentFrameWidth;

        // to avoid vertical overflow, we have to check the size resp. the proportion
        if (this.matrixFrameHeight / this.proportion > parentFrameHeight) {
          this.proportion = this.matrixFrameHeight / parentFrameHeight;
        }

        // set width and height of the frame
        this.frameWidth = Math.round(this.matrixFrameWidth / this.proportion);
        this.frameHeight = Math.round(this.matrixFrameHeight / this.proportion);

        // set the size of the matrix file
        this.frame.nativeElement.style['background-image'] = `url(${this.matrix})`;
        this.frame.nativeElement.style['background-size'] = `${Math.round(this.matrixWidth / this.proportion)}px auto`;
        this.frame.nativeElement.style['width'] = `${this.frameWidth}px`;
        this.frame.nativeElement.style['height'] = `${this.frameHeight}px`;
        this.loaded.emit(true);
      },
      () => {
        // preview file is not available: show default error image
        this.frame.nativeElement.style['background-image'] = 'url(assets/images/preview-not-available.png)';
        this.frame.nativeElement.style['background-size'] = 'cover';
        this.frame.nativeElement.style['width'] = '100%';
        this.frame.nativeElement.style['height'] = '100%';
        this.loaded.emit(true);
      }
    );
  }

  /**
   * updates preview frame by mouse position
   * @param ev
   */
  updatePreviewByPosition(ev: MouseEvent) {
    const position: number = ev.offsetX;

    // one frame per 6 pixels
    if (Number.isInteger(position / 6)) {
      // calculate time from relative mouse position;
      this.time = (ev.offsetX / this._host.nativeElement.offsetWidth) * this.fileInfo.duration;

      this.updatePreviewByTime();
    }
  }

  /**
   * updates preview frame by time
   */
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

    if (curMatrixNr <= 0) {
      curMatrixNr = 0;
    }

    // set current matrix file url
    this._getMatrixFile(curMatrixNr);

    if (!this.previewError) {
      let curFrameNr: number = Math.floor(this.time / 10) - Math.floor(36 * curMatrixNr);

      if (curFrameNr < 0) {
        curFrameNr = 0;
      }
      if (curFrameNr > this.lastMatrixFrameNr) {
        curFrameNr = this.lastMatrixFrameNr;
      }

      // calculate current line and column number in the matrix and get current frame / preview image position
      const curLineNr: number = Math.floor(curFrameNr / 6);
      const curColNr: number = Math.floor(curFrameNr - curLineNr * 6);
      const cssParams = `-${curColNr * this.frameWidth}px -${curLineNr * this.frameHeight}px`;

      this.frame.nativeElement.style['background-image'] = `url(${this.matrix})`;
      this.frame.nativeElement.style['background-position'] = cssParams;
    }
  }

  /**
   * get matrix file by filenumber and with information from video file
   * @param fileNumber
   */
  private _getMatrixFile(fileNumber: number) {
    // get matrix url from video url
    // get base path from http://0.0.0.0:1024/1111/5AiQkeJNbQn-ClrXWkJVFvB.mp4/file
    // => http://0.0.0.0:1024/1111/5AiQkeJNbQn-ClrXWkJVFvB
    const basePath = this.src.fileUrl.substring(0, this.src.fileUrl.lastIndexOf('/')).replace(/\.[^/.]+$/, '');
    // and file name
    // => 5AiQkeJNbQn-ClrXWkJVFvB
    const fileName = basePath.substring(basePath.lastIndexOf('/') + 1);

    const matrixUrl = `${basePath}/${fileName}_m_${fileNumber}.jpg/file`;
    // if the new matrix url is different than the current one, the current one will be replaced
    if (this.matrix !== matrixUrl) {
      this.matrix = matrixUrl;
      this.calculateSizes(this.matrix, fileNumber);
    }
  }

  /**
   * gets matrix dimension (width and height)
   * if the file does not exist, return an error
   * @param matrix
   * @returns matrix dimension or error event
   */
  private _getMatrixDimension(matrix: string): Observable<Dimension | Event> {
    const mapLoadedImage = (event): Dimension => ({
      width: event.target.width,
      height: event.target.height,
    });

    const image = new Image();

    const imageComplete = fromEvent(image, 'load').pipe(take(1), map(mapLoadedImage));
    const imageError = fromEvent(image, 'error').pipe(
      tap(() => {
        this.previewError = true;
        const error: Error = new Error();
        error.message = 'Preview not available';
        error.name = '404 error';
        throw error;
      })
    );
    image.src = matrix;
    return merge(imageComplete, imageError);
  }
}
