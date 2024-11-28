import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ReadArchiveFileValue,
  ReadAudioFileValue,
  ReadDocumentFileValue,
  ReadMovingImageFileValue,
  ReadProject,
  ReadResource,
  ReadStillImageExternalFileValue,
  ReadStillImageFileValue,
} from '@dasch-swiss/dsp-js';
import { ResourceUtil } from '@dasch-swiss/vre/shared/app-common';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';
import { AppError } from '@dasch-swiss/vre/shared/app-error-handler';
import { AccessTokenService } from '@dasch-swiss/vre/shared/app-session';
import { IKeyValuePairs, ResourceSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { FileInfo } from './representation.types';

@Injectable({
  providedIn: 'root',
})
export class RepresentationService {
  constructor(
    private _appConfigService: AppConfigService,
    private readonly _http: HttpClient,
    private _store: Store,
    private _accessTokenService: AccessTokenService
  ) {}

  getFileInfo(url: string) {
    const pathToJson = `${url.substring(0, url.lastIndexOf('/'))}/knora.json`;
    return this._http.get<{ originalFilename?: string }>(pathToJson, { withCredentials: true });
  }

  getIngestFileInfo(projectShort: string, assetId: string): Observable<FileInfo> {
    const url = `${this._appConfigService.dspIngestConfig.url}/projects/${projectShort}/assets/${assetId}`;
    return this._http.get<FileInfo>(url);
  }

  getAttachedProject(parentResource: ReadResource): ReadProject | undefined {
    const attachedProjects = this._store.selectSnapshot(ResourceSelectors.attachedProjects);
    return this.getParentResourceAttachedProject(attachedProjects, parentResource);
  }

  getParentResourceAttachedProject(attachedProjects: IKeyValuePairs<ReadProject>, parentResource: ReadResource) {
    return attachedProjects[parentResource.id] && attachedProjects[parentResource.id].value.length > 0
      ? attachedProjects[parentResource.id].value.find(u => u.id === parentResource.attachedToProject)
      : undefined;
  }

  userCanView(fileValue: ReadDocumentFileValue) {
    return fileValue && ResourceUtil.userCanView(fileValue);
  }

  downloadProjectFile(
    fileValue:
      | ReadAudioFileValue
      | ReadDocumentFileValue
      | ReadMovingImageFileValue
      | ReadStillImageFileValue
      | ReadStillImageExternalFileValue
      | ReadArchiveFileValue,
    projectShortCode?: string
  ) {
    const assetId = fileValue.filename.split('.')[0] || '';

    if (!projectShortCode) {
      throw new AppError('Error with project shortcode');
    }

    this.getIngestFileInfo(projectShortCode, assetId)
      .pipe(take(1))
      .subscribe(response => {
        this.downloadFile(fileValue.fileUrl, response.originalFilename, this.userCanView(fileValue));
      });
  }

  private downloadFile(url: string, originalFileName?: string, userCanView = true) {
    let headers = {};
    const isLoggedIn = this._store.selectSnapshot(UserSelectors.isLoggedIn);
    const withCredentials = isLoggedIn && userCanView;
    if (withCredentials) {
      const authToken = this._accessTokenService.getAccessToken();
      headers = { Authorization: `Bearer ${authToken}` };
    }
    this._http
      .get(url, {
        responseType: 'blob',
        withCredentials,
        headers,
      })
      .pipe(take(1))
      .subscribe(res => {
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(res);
        a.download = originalFileName || url.split('/').pop()!;
        a.click();
        window.URL.revokeObjectURL(a.href);
      });
  }
}
