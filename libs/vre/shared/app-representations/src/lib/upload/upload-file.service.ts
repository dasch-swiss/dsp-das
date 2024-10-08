import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';
import { AccessTokenService } from '@dasch-swiss/vre/shared/app-session';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UploadedFileResponse } from './upload-file-response.interface';
import { UploadedFile } from './uploaded-file.interface';

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
  upload(file: File, shortcode: string): Observable<UploadedFile> {
    const jwt = this._accessTokenService.getAccessToken()!;
    const headers = new HttpHeaders({
      'Content-Type': 'application/octet-stream',
      Authorization: `Bearer ${jwt}`,
    });

    const options = {
      reportProgress: false,
      observe: 'body' as const,
      headers,
    };

    const encodedFilename = encodeURIComponent(file.name);
    const url = `${this._acs.dspIngestConfig.url}/projects/${shortcode}/assets/ingest/${encodedFilename}`;

    return this._http.post<UploadedFileResponse>(url, file, options).pipe(
      map(res => {
        const baseUrl = `${this._acs.dspIiifConfig.iiifUrl}/${shortcode}/${res.internalFilename}`;
        return {
          internalFilename: res.internalFilename,
          thumbnailUrl: `${baseUrl}/full/^256,/0/default.jpg`,
          baseUrl,
        };
      })
    );
  }
}
