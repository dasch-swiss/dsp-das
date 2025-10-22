import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { Constants, KnoraApiConnection, ReadResource, ReadStillImageFileValue } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';

@Component({
  selector: 'app-resource-list-image-item',
  template: ` <img [src]="src ?? 'https://placehold.co/300x400'" style="max-width: 100%" />`,
  standalone: false,
  styles: [
    `
      img {
        max-width: 100%;
        max-height: 200px;
        width: auto;
        height: auto;
        object-fit: contain; /* or 'cover' if you prefer cropping */
        display: block; /* remove inline spacing */
        margin: auto;
      }
    `,
  ],
})
export class ResourceListImageItemComponent implements OnInit {
  @Input({ required: true }) resource!: ReadResource;

  src?: string;
  constructor(
    @Inject(DspApiConnectionToken)
    private readonly _dspApiConnection: KnoraApiConnection,
    private readonly _cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('init');
    return this._dspApiConnection.v2.res.getResource(this.resource.id).subscribe(v => {
      const image = (v.properties[Constants.HasStillImageFileValue][0] as ReadStillImageFileValue).fileUrl;
      this.src = this.resizeIiifImage(image);
      console.log('received', this.src);
      this._cdr.detectChanges();
    });
  }

  resizeIiifImage(url: string, maxSize = 200): string {
    // Match IIIF URLs like .../full/2119,2589/0/default.jpg
    const regex = /(\/full\/)(\d+),(\d+)(\/0\/default\.jpg)/;

    const match = url.match(regex);
    if (!match) {
      // Not a standard IIIF URL; fallback to original
      return url;
    }

    const originalWidth = parseInt(match[2], 10);
    const originalHeight = parseInt(match[3], 10);

    // Compute scaled dimensions preserving aspect ratio
    const scale = Math.min(maxSize / originalWidth, maxSize / originalHeight, 1);
    const newWidth = Math.round(originalWidth * scale);
    const newHeight = Math.round(originalHeight * scale);

    // Reconstruct URL with new dimensions
    return url.replace(regex, `$1${newWidth},${newHeight}$4`);
  }
}
