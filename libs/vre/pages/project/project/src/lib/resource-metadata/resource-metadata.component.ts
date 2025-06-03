import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { KnoraApiConfig } from '@dasch-swiss/dsp-js';
import { DspApiConfigToken } from '@dasch-swiss/vre/core/config';
import { Observable } from 'rxjs';

type DownloadFormat = 'csv' | 'tsv' | 'json';

@Component({
  selector: 'app-resource-metadata',
  templateUrl: './resource-metadata.component.html',
  styleUrl: './resource-metadata.component.scss',
})
export class ResourceMetadataComponent {
  constructor(
    @Inject(DspApiConfigToken) private _dspApiConfig: KnoraApiConfig,
    private _http: HttpClient
  ) {}

  download(shortcode = '0854', format: DownloadFormat = 'csv'): void {
    this._getResourceMetadata(shortcode, format).subscribe(response => {
      const blob = new Blob([response], { type: this._getMimeType(format) });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      //   console.log(response.headers.get('Content-Disposition'));
      link.href = url;
      link.download = `metadata.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  }

  private _getResourceMetadata(shortcode: string, format: DownloadFormat): Observable<any> {
    const baseUrl = this._getIriBaseUrl();

    const headers = new HttpHeaders({
      Accept: this._getMimeType(format),
      'Content-Disposition': 'attachment',
    });

    return this._http.get(
      `${baseUrl}/v2/metadata/projects/${encodeURIComponent(shortcode)}/resources?format=${format}`,
      {
        headers,
        responseType: 'text',
      }
    );
  }

  private _getMimeType(format: string): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'tsv':
        return 'text/tab-separated-values';
      case 'json':
        return 'application/json';
      default:
        return 'text/plain';
    }
  }

  private _getIriBaseUrl(): string {
    return `${this._dspApiConfig.apiProtocol}://${this._dspApiConfig.apiHost}${
      this._dspApiConfig.apiPort !== null ? `:${this._dspApiConfig.apiPort}` : ''
    }${this._dspApiConfig.apiPath}`;
  }
}
