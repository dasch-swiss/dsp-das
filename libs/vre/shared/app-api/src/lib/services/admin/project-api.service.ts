import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  KeywordsResponse,
  MembersResponse,
  Project,
  ProjectResponse,
  ProjectRestrictedViewSettingsResponse,
  ProjectsResponse,
  UpdateProjectRequest,
} from '@dasch-swiss/dsp-js';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';
import { SetRestrictedViewRequest } from 'libs/vre/open-api/src/generated/model/set-restricted-view-request';
import { AdminProjectsApiService } from '../../../../../../open-api/src/generated/api/admin-projects-api.service';
import { BaseApi } from '../base-api';

export type ProjectIdentifier = 'iri' | 'shortname' | 'shortcode';
@Injectable({
  providedIn: 'root',
})
export class ProjectApiService extends BaseApi {
  constructor(
    private _http: HttpClient,
    private _appConfig: AppConfigService,
    private adminProjectsApiService: AdminProjectsApiService
  ) {
    super('admin/projects', _appConfig.dspApiConfig);
  }

  list() {
    return this._http.get<ProjectsResponse>(this.baseUri);
  }

  get(id: string, idType: ProjectIdentifier = 'iri') {
    return this._http.get<ProjectResponse>(this._projectRoute(id, idType));
  }

  create(project: Project) {
    return this._http.post<ProjectResponse>(this.baseUri, project);
  }

  update(iri: string, updatedProject: UpdateProjectRequest) {
    return this._http.put<ProjectResponse>(this._projectRoute(iri), updatedProject);
  }

  delete(iri: string) {
    return this._http.delete<ProjectResponse>(this._projectRoute(iri));
  }

  getKeywordsForProject(iri: string) {
    return this._http.get<KeywordsResponse>(`${this._projectRoute(iri)}/Keywords`);
  }

  getMembersForProject(id: string, idType: ProjectIdentifier = 'iri') {
    return this._http.get<MembersResponse>(`${this._projectRoute(id, idType)}/members`);
  }

  getAdminMembersForProject(id: string, idType: ProjectIdentifier = 'iri') {
    return this._http.get<MembersResponse>(`${this._projectRoute(id, idType)}/admin-members`);
  }

  getRestrictedViewSettingsForProject(id: string, idType: ProjectIdentifier = 'iri') {
    return this._http.get<ProjectRestrictedViewSettingsResponse>(
      `${this._projectRoute(id, idType)}/RestrictedViewSettings`
    );
  }

  //TODO should be used directly from open-api
  postAdminProjectsIriProjectiriRestrictedviewsettings(
    projectIri: string,
    setRestrictedViewRequest: SetRestrictedViewRequest
  ) {
    return this.adminProjectsApiService.postAdminProjectsIriProjectiriRestrictedviewsettings(
      projectIri,
      this._appConfig.dspApiConfig.jsonWebToken,
      setRestrictedViewRequest
    );
  }

  private _projectRoute(id: string, idType: ProjectIdentifier = 'iri') {
    return `${this.baseUri}/${idType}/${encodeURIComponent(id)}`;
  }
}
