import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';
import { AccessTokenService, AuthService } from '@dasch-swiss/vre/shared/app-session';
import { Observable } from 'rxjs';

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
   * uploads files to SIPI
   * @param (file)
   */
  upload(file: FormData): Observable<UploadedFileResponse> {
    const uploadUrl = `${this._acs.dspIiifConfig.iiifUrl}/upload`;

    const jwt = this._accessTokenService.getAccessToken();
    const params = new HttpParams().set('token', jwt);

    // --> TODO in order to track the progress change below to true and 'events'
    const options = {
      params,
      reportProgress: false,
      observe: 'body' as const,
    };
    return this._http.post<UploadedFileResponse>(uploadUrl, file, options);
  }
}
