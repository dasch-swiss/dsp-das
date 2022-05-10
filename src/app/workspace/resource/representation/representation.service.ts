import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class RepresentationService {

    constructor() { }

    doesFileExist(urlToFile: string): boolean {
        const pathToKnoraJson = urlToFile.substring(0, urlToFile.lastIndexOf('/')) + '/knora.json';
        try {
            const xhr = new XMLHttpRequest();

            xhr.open('GET', pathToKnoraJson, false);
            xhr.withCredentials = true;
            xhr.send();

            // fetch(urlToFile, {
            //     credentials: 'include'
            // }).then(response => response.json())
            //     .then(data => console.log('fetch data', data));

            // console.log('xhr', xhr);

            return xhr.status === 200;

        } catch (e) {
            // console.log('error', e);
            return false;
        }
    }
}
