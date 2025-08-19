import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ReadArchiveFileValue,
  ReadAudioFileValue,
  ReadDocumentFileValue,
  ReadMovingImageFileValue,
  ReadResource,
  ReadStillImageExternalFileValue,
  ReadStillImageFileValue,
} from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { AppConfigService } from '@dasch-swiss/vre/core/config';
import { AccessTokenService } from '@dasch-swiss/vre/core/session';
import { UserSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { map, take } from 'rxjs';
import { ResourceUtil } from './resource.util';

@Injectable({
  providedIn: 'root',
})
export class RepresentationService {
  constructor(
    private _appConfigService: AppConfigService,
    private readonly _http: HttpClient,
    private _store: Store,
    private _accessTokenService: AccessTokenService,
    private _projectApiService: ProjectApiService
  ) {}

  getFileInfo(url: string) {
    const pathToJson = `${url.substring(0, url.lastIndexOf('/'))}/knora.json`;
    return this._http.get<{ originalFilename?: string }>(pathToJson, { withCredentials: true });
  }

  getIngestFileUrl(projectShort: string, assetId: string): string {
    const url = `${this._appConfigService.dspIngestConfig.url}/projects/${projectShort}/assets/${assetId}`;
    return url;
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
    resource: ReadResource
  ) {
    this.getProject(resource).subscribe(attachedProject => {
      const assetId = fileValue.filename.split('.')[0] || '';
      const ingestFileUrl = this.getIngestFileUrl(attachedProject.shortcode, assetId);
      this.downloadFile(ingestFileUrl, this.userCanView(fileValue));
    });
  }

  getProject(resource: ReadResource) {
    return this._projectApiService.get(resource.attachedToProject).pipe(map(response => response.project));
  }

  private downloadFile(url: string, userCanView = true) {
    let headers = {};
    const isLoggedIn = this._store.selectSnapshot(UserSelectors.isLoggedIn);
    if (isLoggedIn && userCanView) {
      const authToken = this._accessTokenService.getAccessToken();
      headers = new HttpHeaders({
        Authorization: `Bearer ${authToken}`,
      });
    }

    this._http
      .get(userCanView ? `${url}/original` : url, {
        responseType: 'blob',
        headers,
        observe: 'response',
      })
      .pipe(take(1))
      .subscribe((res: HttpResponse<Blob>) => {
        const contentDisposition = res.headers.get('content-disposition');
        let fileName: string | null = null;
        if (contentDisposition) {
          const fileNameRegex = /filename\*=(?:([a-zA-Z0-9-]+)''([^;'\n]*))|filename=([^;'\n]*)/;
          const matches = fileNameRegex.exec(contentDisposition);
          fileName =
            matches && matches[2]
              ? decodeURIComponent(matches[2].replace(/\+/g, ' '))
              : matches && matches[3]
                ? matches[3].replace(/['"]/g, '').replace(/\+/g, ' ')
                : null;
        }

        // Fallback to extracting filename from URL if not found
        if (!fileName) {
          fileName = url.split('/').pop()!;
        }

        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(res.body!);
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(a.href);
      });
  }
}
