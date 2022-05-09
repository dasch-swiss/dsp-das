import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class RepresentationService {

    constructor() { }

    doesFileExist(urlToFile: string): boolean {
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('HEAD', urlToFile, false);
            xhr.send();

            if (xhr.status !== 200) {
                return false;
            } else {
                return true;
            }
        } catch (e) {
            return false;
        }
    }
}
