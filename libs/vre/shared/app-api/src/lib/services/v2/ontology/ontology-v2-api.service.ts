import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApi } from '../../base-api';
import { OntologyMetadata } from './ontology-metadata.interface';
import { Graph } from '../../../interfaces/graph.interface';
import { ReadOntology } from './read-ontology.interface';
import { CreateOntology } from './create-ontology.interface';
import { CanDeleteResponse } from './can-delete-response.interface';

@Injectable({
    providedIn: 'root'
})
export class OntologyV2ApiService extends BaseApi {
    constructor(private _http: HttpClient) {
        super('v2/ontologies');
    }

    getMetadata() {
        return this._http.get<Graph<OntologyMetadata>>(`${this.baseUri}/metadata`);
    }

    get(ontologyIri: string, allLanguages = false) {
        return this._http.get<ReadOntology>(`${this.baseUri}/allentities/${encodeURIComponent(ontologyIri)}${allLanguages ? '?allLanguages=true' : ''}`);
    }

    getByProject(iri: string) {
        return this._http.get<Graph<OntologyMetadata>>(`${this.baseUri}/metadata/${encodeURIComponent(iri)}`);
    }

    create(ontology: CreateOntology) {
        return this._http.post<OntologyMetadata>(this.baseUri, ontology);
    }

    canDelete(iri: string) {
        return this._http.get<CanDeleteResponse>(`${this.baseUri}/candeleteontology/${encodeURIComponent(iri)}`);
    }

    delete(iri: string, lastModificationDate: string) {
        return this._http.get(`${this.baseUri}/${encodeURIComponent(iri)}?lastModificationDate=${lastModificationDate}`);
    }

    update() {
        // TODO
    }

    deleteComment(iri: string, lastModificationDate: string) {
        return this._http.delete(`${this.baseUri}/comment/${encodeURIComponent(iri)}?lastModificationDate=${lastModificationDate}`);
    }

    private _update(iri: string, ontologyMetaData: OntologyMetadata) {
        return this._http.put<OntologyMetadata>(`${this.baseUri} /${encodeURIComponent(iri)}`, ontologyMetaData);
    }
}
