import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Constants, ReadResource, ReadStillImageFileValue } from '@dasch-swiss/dsp-js';
import { ReadStillImageExternalFileValue } from '@dasch-swiss/dsp-js/src/models/v2/resources/values/read/read-file-value';
import { AppError } from '@dasch-swiss/vre/shared/app-error-handler';
import { RegionService } from '../region.service';
import { IIIFUrl } from '../third-party-iiif/third-party-iiif';
import { OpenSeaDragonService } from './open-sea-dragon.service';
import { OsdDrawerService } from './osd-drawer.service';
import { StillImageHelper } from './still-image-helper';

export interface PolygonsForRegion {
  [key: string]: HTMLElement[];
}

@Component({
  selector: 'app-still-image',
  templateUrl: './still-image.component.html',
  styleUrls: ['./still-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OsdDrawerService, OpenSeaDragonService],
})
export class StillImageComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) resource!: ReadResource;
  @ViewChild('osdViewer') osdViewerElement!: ElementRef;

  isViewInitialized = false;
  isPng: boolean = false;

  get imageFileValue() {
    const image = this.resource.properties[Constants.HasStillImageFileValue][0];
    switch (image.type) {
      case Constants.StillImageFileValue:
        return image as ReadStillImageFileValue;
      case Constants.StillImageExternalFileValue:
        return image as ReadStillImageExternalFileValue;
      default:
        throw new AppError('Unknown image type');
    }
  }

  constructor(
    public osdDrawerService: OsdDrawerService,
    public osd: OpenSeaDragonService,
    private _region: RegionService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.osd.viewer = this.osdViewerElement.nativeElement;
    this.isViewInitialized = true;
    this.osdDrawerService.onInit(this.osd.viewer, this.resource);
    // this.osdDrawerService.trackClickEvents();
    this._loadImages();
    this._cdr.detectChanges();

    /**  TODO should I move it or replace
         this._resourceFetcherService.settings.imageFormatIsPng
         .asObservable()
         .pipe(takeUntil(this._ngUnsubscribe))
         .subscribe((isPng: boolean) => {
         this.isPng = isPng;
         this._loadImages();
         });
         */
  }

  ngOnDestroy() {
    this.osd.viewer.destroy();
  }

  private _openInternalImages(): void {
    const tiles = StillImageHelper.prepareTileSourcesFromFileValues(
      [this.imageFileValue as ReadStillImageFileValue],
      this.isPng
    );
    this.osd.viewer.open(tiles);
  }

  private _loadImages() {
    if (this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageFileValue) {
      this._openInternalImages();
    } else if (
      this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageExternalFileValue
    ) {
      this._loadExternalIIIF();
    }

    this.osd.viewer.addHandler('open', () => {
      this._region.imageIsLoaded();
    });
  }

  private _loadExternalIIIF() {
    if (this.imageFileValue instanceof ReadStillImageExternalFileValue) {
      const i3f = IIIFUrl.createUrl(this.imageFileValue.externalUrl);
      if (!i3f) {
        throw new AppError('Error with IIIF URL');
      }

      this.osd.viewer.open(i3f.infoJsonUrl);
    }
  }
}
