import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Constants, ReadProject, ReadResource, ReadStillImageFileValue } from '@dasch-swiss/dsp-js';
import { ReadStillImageExternalFileValue } from '@dasch-swiss/dsp-js/src/models/v2/resources/values/read/read-file-value';
import { AppError } from '@dasch-swiss/vre/shared/app-error-handler';
import * as OpenSeadragon from 'openseadragon';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { RegionService } from '../region.service';
import { RepresentationService } from '../representation.service';
import { FileInfo } from '../representation.types';
import { ResourceFetcherService } from '../resource-fetcher.service';
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
export class StillImageComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) resource!: ReadResource;
  @Input() attachedProject: ReadProject | undefined;

  defaultFailureStatus: number = 404;
  isPng: boolean = false;
  imageFileInfo: FileInfo | undefined = undefined;
  failedToLoad = false;

  private _viewer: OpenSeadragon.Viewer | undefined;
  private _ngUnsubscribe = new Subject<void>();

  get imageFileValue(): ReadStillImageFileValue | ReadStillImageExternalFileValue | undefined {
    if (this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageFileValue) {
      return this.resource.properties[Constants.HasStillImageFileValue][0] as ReadStillImageFileValue;
    }
    if (this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageExternalFileValue) {
      return this.resource.properties[Constants.HasStillImageFileValue][0] as ReadStillImageExternalFileValue;
    } else return undefined;
  }

  constructor(
    private _domSanitizer: DomSanitizer,
    private _elementRef: ElementRef,
    private _matIconRegistry: MatIconRegistry,
    private _rs: RepresentationService,
    private _regionService: RegionService,
    private _resourceFetcherService: ResourceFetcherService,
    public _osdDrawerService: OsdDrawerService
  ) {
    OpenSeadragon.setString('Tooltips.Home', '');
    OpenSeadragon.setString('Tooltips.ZoomIn', '');
    OpenSeadragon.setString('Tooltips.ZoomOut', '');
    OpenSeadragon.setString('Tooltips.FullPage', '');

    // own draw region icon; because it does not exist in the material icons
    this._matIconRegistry.addSvgIcon(
      'draw_region_icon',
      this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/draw-region-icon.svg')
    );
  }

  ngOnInit() {
    this._setupViewer();
    this._osdDrawerService.onInit(this._viewer!);
    this._osdDrawerService.addRegionDrawer();
    this._loadImages();

    this._resourceFetcherService.settings.imageFormatIsPng
      .asObservable()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((isPng: boolean) => {
        this.isPng = isPng;
        this._loadImages();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['resource'] || changes['resource'].isFirstChange()) {
      return;
    }
    this._loadImages();
  }

  ngOnDestroy() {
    if (this._viewer) {
      this._viewer.destroy();
      this._viewer = undefined;
    }
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  private _setupViewer(): void {
    const viewerContainer = this._elementRef.nativeElement.getElementsByClassName('osd-container')[0];

    this._viewer = new OpenSeadragon.Viewer({
      element: viewerContainer,
      ...osdViewerConfig,
    });

    this._viewer.addHandler('full-screen', args => {
      if (args.fullScreen) {
        viewerContainer.classList.add('fullscreen');
      } else {
        viewerContainer.classList.remove('fullscreen');
      }
    });
  }

  private _assertOSDViewer(): OpenSeadragon.Viewer {
    if (!this._viewer) {
      throw new AppError('OpenSeaDragon Viewer not initialized');
    }
    return this._viewer;
  }

  private _openInternalImages(): void {
    const viewer = this._assertOSDViewer();
    this.failedToLoad = false;

    const fileValues: ReadStillImageFileValue[] = [this.imageFileValue as ReadStillImageFileValue]; // TODO this was this.images.

    // display only the defined range of this.images
    const tileSources: object[] = StillImageHelper.prepareTileSourcesFromFileValues(fileValues, this.isPng);
    viewer.addOnceHandler('open', args => {
      console.log('arg', args);
      // check if the current image exists
      if (this.imageFileValue instanceof ReadStillImageFileValue) {
        /** TODO there was this weird condition inside
                 this.imageFileValue.fileUrl.includes(args.source!['id']!)
                 */

        // enable mouse navigation incl. zoom
        viewer.setMouseNavEnabled(true);
        // enable the navigator
        viewer.navigator.element.style.display = 'block';
        this._regionService.imageIsLoaded();
      }
    });
    viewer.open(tileSources);
  }

  private _loadImages() {
    this._assertOSDViewer().close();

    if (this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageFileValue) {
      this._loadInternalImages();
    } else if (
      this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageExternalFileValue
    ) {
      this._loadExternalIIIF();
    }
  }

  private _loadInternalImages() {
    const projectShort = this.resource.attachedToProject.split('/').pop();
    const assetId = this.imageFileValue?.filename.split('.')[0] || '';

    if (!projectShort) {
      throw new AppError('Error with project shortcode');
    }

    this._rs
      .getIngestFileInfo(projectShort, assetId)
      .pipe(take(1))
      .subscribe((fileInfo: FileInfo) => {
        this.imageFileInfo = fileInfo;
        if (this.failedToLoad) {
          this._onSuccessAfterFailedImageLoad();
        }
        this._openInternalImages();
      });
  }

  private _loadExternalIIIF() {
    if (this.imageFileValue instanceof ReadStillImageExternalFileValue) {
      const iiif = IIIFUrl.createUrl(this.imageFileValue.externalUrl);
      if (iiif) {
        if (this.failedToLoad) {
          this._onSuccessAfterFailedImageLoad();
        }
        this._viewer?.open(iiif.infoJsonUrl);
      }
    }
  }

  private _onSuccessAfterFailedImageLoad() {
    const viewer = this._assertOSDViewer();
    this.failedToLoad = false;
    viewer.setMouseNavEnabled(true);
    viewer.navigator.element.style.display = 'block';
    this._regionService.imageIsLoaded();
  }
}
