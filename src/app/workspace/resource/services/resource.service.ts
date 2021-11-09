import { Injectable } from '@angular/core';
import { AppInitService } from 'src/app/app-init.service';

@Injectable({
    providedIn: 'root'
})
export class ResourceService {

    constructor(
        private _appInitService: AppInitService
    ) { }

    /**
     * gets resource path `[project-shortcode]/[resource-uuid]`
     * @param iri e.g. http://rdfh.ch/082B/SQkTPdHdTzq_gqbwj6QR-A
     * @returns resource path --> /082B/SQkTPdHdTzq_gqbwj6QR-A
     */
    getResourcePath(iri: string): string {
        return iri.replace(this._appInitService.dspAppConfig.iriBase, '');
    }

    /**
     * gets resource iri
     * @param shortcode e.g. 082B
     * @param uuid e.g. SQkTPdHdTzq_gqbwj6QR-A
     * @returns resource iri --> http://rdfh.ch/082B/SQkTPdHdTzq_gqbwj6QR-A
     */
    getResourceIri(shortcode: string, uuid: string): string {
        return this._appInitService.dspAppConfig.iriBase + '/' + shortcode + '/' + uuid;
    }
}
