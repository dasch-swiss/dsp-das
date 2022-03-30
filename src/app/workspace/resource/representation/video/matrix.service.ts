import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { fromEvent, Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

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

@Injectable({
    providedIn: 'root'
})
export class MatrixService {

    constructor(
        private http: HttpClient
    ) { }

    /**
     * returns sipi image information about the matrix file
     *
     * @param matrix url to matrix file
     */
    getMatrixInfo(matrix: string): Observable<SipiImageInfo> {
        return this.http.get<SipiImageInfo>(matrix)
            .pipe(
                catchError(this._handleError<any>('getMatrixInfo', {}))
            );
    }

    getMatrixFileInfo(matrixUrl: string): Size {
        let size: Size;
        const img = new Image();
        img.addEventListener('load', function() {
            size = {
                width: this.naturalWidth,
                height: this.naturalHeight
            };
        });
        img.src = matrixUrl;

        return size;
    }

    getMatrixSize(matrix: string): Observable<Size> {
        const mapLoadedImage = (event): Size => {
            return {
                width: event.target.width,
                height: event.target.height
            };
        };

        const image = new Image();
        const $loadedImg = fromEvent(image, 'load').pipe(take(1), map(mapLoadedImage));
        // rxjs 4 - let $loadedImg = Observable.fromEvent(image, "load").take(1).map(mapLoadedImage);
        image.src = matrix;
        return $loadedImg;
    }

    // getCurrentFrame(time: number, video: Video): string {
    //     this.getMatrixInfo(environment.iiifUrl + video.name + '_m_0.jpg/info.json').subscribe((res: SipiImageInfo) => {

    //     })
    //     return 'sipiurl';
    // }


    /**
     * handle Http operation that failed.
     * let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private _handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // --> TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // --> TODO: better job of transforming error for user consumption
            this._log(`${operation} failed: ${error.message}`);

            // let the app keep running by returning an empty result.
            return of(result as T);
        };
    }

    /**
     * log a HeroService message with the MessageService
     */
    private _log(message: string) {
        console.log(message);
        // this.messageService.add(`MatrixService: ${message}`);
    }

}
