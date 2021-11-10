import { Injectable } from '@angular/core';
import { AppInitService } from 'src/app/app-init.service';

@Injectable({
    providedIn: 'root'
})
export class ResourceService {

    iriBase: string;

    constructor(
        private _ais: AppInitService
    ) {
        this.iriBase = this._getIriBaseWithoutEndingSlash(this._ais.dspAppConfig.iriBase);
    }

    /**
     * gets resource path `[project-shortcode]/[resource-uuid]`
     * @param iri e.g. http://rdfh.ch/082B/SQkTPdHdTzq_gqbwj6QR-A
     * @returns resource path --> /082B/SQkTPdHdTzq_gqbwj6QR-A
     */
    getResourcePath(iri: string): string {
        return iri.replace(this.iriBase, '');
    }

    /**
     * gets resource iri
     * @param shortcode e.g. 082B
     * @param uuid e.g. SQkTPdHdTzq_gqbwj6QR-A
     * @returns resource iri --> http://rdfh.ch/082B/SQkTPdHdTzq_gqbwj6QR-A
     */
    getResourceIri(shortcode: string, uuid: string): string {
        return this.iriBase + '/' + shortcode + '/' + uuid;
    }

    /**
     * returns iri base without ending slash
     * @returns iri base without ending slash
     */
    private _getIriBaseWithoutEndingSlash(base: string): string {
        const lastChar = base.substring(base.length - 1);
        return (lastChar === '/' ? base.slice(0, -1) : base);
    }
}
