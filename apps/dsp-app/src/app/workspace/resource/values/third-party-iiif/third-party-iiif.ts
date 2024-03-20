import { FormControl, FormGroup } from '@angular/forms';

export type IiiifUrlForm = FormGroup<{
  url: FormControl<string>;
}>;

const possibleFormats = [
  'avif',
  'bmp',
  'gif',
  'heic',
  'heif',
  'jpeg',
  'jpg',
  'jp2',
  'pdf',
  'png',
  'svg',
  'tif',
  'tiff',
  'webp',
];

export class IiifUrl {
  private _url: URL;

  private constructor(url: string) {
    this._url = new URL(url);
  }

  static create(url: string): IiifUrl | null {
    try {
      return new IiifUrl(url.toLowerCase());
    } catch (error) {
      return null;
    }
  }

  private get _baseUrl(): string {
    return `${this._url.protocol}//${this._url.host}`;
  }

  private get _segments(): string[] {
    return this._url.pathname.split('/').slice(1);
  }

  private get _qualitySegment(): string {
    return this._segments[this._segments.length - 1];
  }

  private _isInfoJsonUrl(): boolean {
    return this._segments[this._segments.length - 1] === 'info.json';
  }

  private get _format(): string {
    return this._qualitySegment.indexOf('.') === -1 ? '' : this._qualitySegment.split('.')[1];
  }

  get isValidIiifUrl(): boolean {
    if (this._isInfoJsonUrl()) {
      return this._segments.length >= 2;
    }
    return this._segments.length >= 5 && possibleFormats.includes(this._format);
  }

  get iiifImageInstanceUrl(): string {
    if (this._isInfoJsonUrl()) {
      return `${this._baseUrl}/${this._segments.slice(0, this._segments.length - 1).join('/')}`;
    } else {
      return `${this._baseUrl}/${this._segments.slice(0, this._segments.length - 4).join('/')}`;
    }
  }

  get infoJsonUrl() {
    return `${this.iiifImageInstanceUrl}/info.json`;
  }

  get previewImageUrl() {
    return `${this.iiifImageInstanceUrl}/full/,360/0/default.jpg`;
  }
}
