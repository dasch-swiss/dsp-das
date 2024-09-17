import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { FileInfo } from './representation.types';

@Injectable({
  providedIn: 'root',
})
export class RepresentationService {
  constructor(
    private _appConfigService: AppConfigService,
    private readonly _http: HttpClient
  ) {}

  getFileInfo(url: string) {
    const pathToJson = `${url.substring(0, url.lastIndexOf('/'))}/knora.json`;
    return this._http.get<{ originalFilename?: string }>(pathToJson, { withCredentials: true });
  }

  getIngestFileInfo(projectShort: string, assetId: string): Observable<FileInfo> {
    const url = `${this._appConfigService.dspIngestConfig.url}/projects/${projectShort}/assets/${assetId}`;
    return this._http.get<FileInfo>(url);
  }

  downloadFile(url: string, fileName?: string) {
    this._http
      .get(url, { responseType: 'blob', withCredentials: true })
      .pipe(take(1))
      .subscribe(res => {
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(res);
        a.download = fileName || url.split('/').pop()!;
        a.click();
        window.URL.revokeObjectURL(a.href);
      });
  }
}
