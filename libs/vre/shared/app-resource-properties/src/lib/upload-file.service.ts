import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AppConfigService} from '@dasch-swiss/vre/shared/app-config';
import {AccessTokenService} from '@dasch-swiss/vre/shared/app-session';
import {Observable} from 'rxjs';

export interface UploadedFile {
  fileType: string;
  internalFilename: string;
  originalFilename: string;
  temporaryUrl: string;
}

export interface UploadedFileResponse {
  uploadedFiles: UploadedFile[];
}

@Injectable({
  providedIn: 'root',
})
export class UploadFileService {
  constructor(
    private readonly _acs: AppConfigService,
    private readonly _http: HttpClient,
    private readonly _accessTokenService: AccessTokenService
  ) {}

  /**
   * uploads files to ingest server
   * @param (file) The file to upload
   * @param (shortcode) The project shortcode
   */
  upload(file: File, shortcode: string): Observable<UploadedFileResponse> {

    const jwt = this._accessTokenService.getAccessToken()!;
    const params = new HttpParams().set('token', jwt);

    // --> TODO in order to track the progress change below to true and 'events'
    const options = {
      params,
      reportProgress: false,
      observe: 'body' as const,
    };
    const url = `${this._acs.dspIngestConfig.url}/projects/${shortcode}/assets/ingest/${file.name}`;
    return this._http.post<UploadedFileResponse>(url, file, options);
  }
}
