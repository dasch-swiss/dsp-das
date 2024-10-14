import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Constants, ReadResource, ReadStillImageFileValue } from '@dasch-swiss/dsp-js';
import { ReadStillImageExternalFileValue } from '@dasch-swiss/dsp-js/src/models/v2/resources/values/read/read-file-value';
import { AppError } from '@dasch-swiss/vre/shared/app-error-handler';
import * as OpenSeadragon from 'openseadragon';
import { Subject } from 'rxjs';
import { IIIFUrl } from '../third-party-iiif/third-party-iiif';
import { OsdDrawerService } from './osd-drawer.service';
import { osdViewerConfig } from './osd-viewer.config';
import { StillImageHelper } from './still-image-helper';

export interface PolygonsForRegion {
  [key: string]: HTMLElement[];
}

@Component({
  selector: 'app-still-image',
  templateUrl: './still-image.component.html',
  styleUrls: ['./still-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OsdDrawerService],
})
export class StillImageComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) resource!: ReadResource;
  @ViewChild('osdViewer') osdViewer!: ElementRef;

  isPng: boolean = false;

  public viewer!: OpenSeadragon.Viewer;
  private _ngUnsubscribe = new Subject<void>();

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

  constructor(public osdDrawerService: OsdDrawerService) {}

  ngAfterViewInit() {
    this._setupViewer();
    this.osdDrawerService.onInit(this.viewer!);
    this.osdDrawerService.addRegionDrawer();
    this._loadImages();

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
    this.viewer?.destroy();
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  private _setupViewer(): void {
    const viewer = this.osdViewer.nativeElement;
    this.viewer = new OpenSeadragon.Viewer({
      element: viewer,
      ...osdViewerConfig,
    });
    // TODO does the following need to be unsubscribed ?
    this.viewer.addHandler('full-screen', args => {
      if (args.fullScreen) {
        viewer.classList.add('fullscreen');
      } else {
        viewer.classList.remove('fullscreen');
      }
    });
  }

  private _openInternalImages(): void {
    const tiles = StillImageHelper.prepareTileSourcesFromFileValues(
      [this.imageFileValue as ReadStillImageFileValue],
      this.isPng
    );
    this.viewer.open(tiles);
  }

  private _loadImages() {
    if (this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageFileValue) {
      this._openInternalImages();
    } else if (
      this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageExternalFileValue
    ) {
      this._loadExternalIIIF();
    }
  }

  private _loadExternalIIIF() {
    if (this.imageFileValue instanceof ReadStillImageExternalFileValue) {
      const i3f = IIIFUrl.createUrl(this.imageFileValue.externalUrl);
      if (!i3f) {
        throw new AppError('Error with IIIF URL');
      }

      this.viewer.open(i3f.infoJsonUrl);
    }
  }
}
