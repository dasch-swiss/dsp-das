import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    KeywordsResponse,
    Project,
    ProjectResponse,
    ProjectsResponse,
    UpdateProjectRequest
} from '@dasch-swiss/dsp-js';
import { BaseApi } from './base-api';

export type ProjectId = 'iri' | 'shortname' | 'shortcode';
@Injectable({
    providedIn: 'root'
})
export class ProjectApiService extends BaseApi {
    constructor(private _http: HttpClient) {
        super('admin/projects');
    }

    list() {
        return this._http.get<ProjectsResponse>(this.baseUri);
    }

    get(id: string, idProperty: ProjectId = 'iri') {
        return this._http.get<ProjectResponse>(this._projectRoute(id, idProperty));
    }

    create(project: Project) {
        return this._http.post(this.baseUri, project);
    }

    update(iri: string, projectInfo: UpdateProjectRequest) {
        return this._http.put<ProjectResponse>(this._projectRoute(iri), projectInfo);
    }

    delete(iri: string) {
        return this._http.delete<ProjectResponse>(this._projectRoute(iri));
    }

    getKeywordsForProject(iri: string) {
        return this._http.get<KeywordsResponse>(`${this._projectRoute(iri)}/Keywords`);
    }

    getMembersForProject(id: string, idProperty: ProjectId = 'iri') {
        return this._http.get(`${this._projectRoute(id, idProperty)}/members`);
    }

    getAdminMembersForProject(id: string, idProperty: ProjectId = 'iri') {
        return this._http.get(`${this._projectRoute(id, idProperty)}/admin-members`);
    }

    getRestrictedViewSettingsForProject(id: string, idProperty: ProjectId = 'iri') {
        return this._http.get(`${this._projectRoute(id, idProperty)}/RestrictedViewSettings`);
    }

    private _projectRoute(id: string, idProperty: ProjectId = 'iri') {
        return `${this.baseUri}/${idProperty}/${encodeURIComponent(id)}`;
    }
}

