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
import { ResourceFetcherService } from '../resource-fetcher.service';
import { IIIFUrl } from '../third-party-iiif/third-party-iiif';
import { OpenSeaDragonService } from './open-sea-dragon.service';
import { OsdDrawerService } from './osd-drawer.service';
import { StillImageHelper } from './still-image-helper';

export interface PolygonsForRegion {
  [key: string]: HTMLElement[];
}

@Component({
  selector: 'app-still-image',
  template: ` <div
      class="osd-container"
      [class.drawing]="isViewInitialized && !osdDrawerService.viewer.isMouseNavEnabled()"
      #osdViewer>
      <!-- in case of an error -->
      <ng-content select="[navigationArrows]"></ng-content>
    </div>

    <div class="toolbar">
      <ng-content select="[slider]" />
      <app-still-image-toolbar *ngIf="isViewInitialized" [resource]="resource" [viewer]="osd.viewer" />
    </div>`,
  styleUrls: ['./still-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OsdDrawerService, OpenSeaDragonService],
})
export class StillImageComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) resource!: ReadResource;
  @ViewChild('osdViewer') osdViewerElement!: ElementRef;

  isViewInitialized = false;

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
    private _cdr: ChangeDetectorRef,
    private _resourceFetcherService: ResourceFetcherService
  ) {}

  ngAfterViewInit() {
    this.osd.viewer = this.osdViewerElement.nativeElement;
    this.isViewInitialized = true;
    this.osdDrawerService.onInit(this.osd.viewer, this.resource);
    this.osdDrawerService.trackClickEvents();

    this.osd.viewer.addHandler('open', () => {
      this._region.imageIsLoaded();
    });

    this._resourceFetcherService.settings.imageFormatIsPng.asObservable().subscribe(() => {
      this._loadImages();
      this._cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.osd.viewer.destroy();
  }

  private _loadImages() {
    switch (this.resource.properties[Constants.HasStillImageFileValue][0].type) {
      case Constants.StillImageFileValue:
        this._openInternalImages();
        break;
      case Constants.StillImageExternalFileValue:
        this._loadExternalIIIF();
        break;
      default:
        throw new AppError('Unknown image type');
    }
  }

  private _openInternalImages(): void {
    const tiles = StillImageHelper.prepareTileSourcesFromFileValues(
      [this.imageFileValue as ReadStillImageFileValue],
      this._resourceFetcherService.settings.imageFormatIsPng.value
    );
    this.osd.viewer.open(tiles);
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
