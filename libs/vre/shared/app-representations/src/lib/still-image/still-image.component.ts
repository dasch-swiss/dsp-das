import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
  Constants,
  KnoraApiConnection,
  Point2D,
  ReadColorValue,
  ReadProject,
  ReadResource,
  ReadStillImageFileValue,
  RegionGeometry,
  UpdateFileValue,
  UpdateResource,
  WriteValueResponse,
} from '@dasch-swiss/dsp-js';
import { ReadStillImageExternalFileValue } from '@dasch-swiss/dsp-js/src/models/v2/resources/values/read/read-file-value';
import { ResourceUtil } from '@dasch-swiss/vre/shared/app-common';
import { DspApiConnectionToken, DspDialogConfig } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import * as OpenSeadragon from 'openseadragon';
import { combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, filter, mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { AddRegionFormDialogComponent, AddRegionFormDialogProps } from '../add-region-form-dialog.component';
import { EditThirdPartyIiifFormComponent } from '../edit-third-party-iiif-form/edit-third-party-iiif-form.component';
import { ThirdPartyIiifProps } from '../edit-third-party-iiif-form/edit-third-party-iiif-types';
import { RegionService } from '../region.service';
import {
  ReplaceFileDialogComponent,
  ReplaceFileDialogProps,
} from '../replace-file-dialog/replace-file-dialog.component';
import { RepresentationService } from '../representation.service';
import { ResourceFetcherService } from '../resource-fetcher.service';
import { IIIFUrl } from '../third-party-iiif/third-party-iiif';
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
})
export class StillImageComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) resource!: ReadResource;
  @Input() attachedProject: ReadProject | undefined;

  destroyed: Subject<void> = new Subject<void>();
  defaultFailureStatus: number = 404;

  get imageFileValue(): ReadStillImageFileValue | ReadStillImageExternalFileValue | undefined {
    if (this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageFileValue) {
      return this.resource.properties[Constants.HasStillImageFileValue][0] as ReadStillImageFileValue;
    }
    if (this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageExternalFileValue) {
      return this.resource.properties[Constants.HasStillImageFileValue][0] as ReadStillImageExternalFileValue;
    } else return undefined;
  }

  isPng: boolean = false;

  get isReadStillImageExternalFileValue(): boolean {
    return !!this.imageFileValue && this.imageFileValue.type === Constants.StillImageExternalFileValue;
  }

  get usercanEdit() {
    return ResourceUtil.userCanEdit(this.resource);
  }

  failedToLoad = false;

  imageFormatIsPng = this._resourceFetcherService.settings.imageFormatIsPng;
  regionDrawMode = false; // stores whether viewer is currently drawing a region
  private _regionDragInfo; // stores the information of the first click for drawing a region
  private _viewer: OpenSeadragon.Viewer | undefined;
  private _regions: PolygonsForRegion = {};

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _dialog: MatDialog,
    private _domSanitizer: DomSanitizer,
    private _elementRef: ElementRef,
    private _matIconRegistry: MatIconRegistry,
    private _notification: NotificationService,
    private _renderer: Renderer2,
    private _rs: RepresentationService,
    private _regionService: RegionService,
    private _resourceFetcherService: ResourceFetcherService,
    private _cd: ChangeDetectorRef
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
    this._loadImages();

    this._regionService.imageIsLoaded$
      .pipe(
        filter(loaded => loaded),
        switchMap(() =>
          combineLatest([this._regionService.showRegions$.pipe(distinctUntilChanged()), this._regionService.regions$])
        )
      )
      .pipe(filter(() => !!this._viewer)) // only proceed if the viewer is already set up
      .subscribe(([showRegion, regions]) => {
        this._removeOverlays();

        if (showRegion) {
          this._renderRegions();
        }
      });

    this._regionService.highlightRegion$.subscribe(region => {
      if (region === null) {
        this._unhighlightAllRegions();
        return;
      }
      this._highlightRegion(region);
    });

    this._resourceFetcherService.settings.imageFormatIsPng
      .asObservable()
      .pipe(takeUntil(this.destroyed))
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
    this.destroyed.next();
    this.destroyed.complete();
  }

  resetStatus() {
    this.defaultFailureStatus = 404;
  }

  /**
   * when the draw region button is clicked, this method is called from the html. It sets the draw mode to true and
   * prevents navigation by mouse (so that the region can be accurately drawn).
   */
  drawButtonClicked(): void {
    this.regionDrawMode = !this.regionDrawMode;
    this._viewer?.setMouseNavEnabled(!this.regionDrawMode);
  }

  /**
   * display message to confirm the copy of the citation link (ARK URL)
   */
  openSnackBar(message: string) {
    this._notification.openSnackBar(message);
  }

  download(url: string) {
    if (this.imageFileValue instanceof ReadStillImageFileValue) {
      this._rs.downloadFile(url, this.imageFileValue.filename);
    }
  }

  replaceImage() {
    let dialogRef;
    if (this.isReadStillImageExternalFileValue) {
      dialogRef = this._dialog.open<EditThirdPartyIiifFormComponent, ThirdPartyIiifProps>(
        EditThirdPartyIiifFormComponent,
        DspDialogConfig.dialogDrawerConfig({
          resourceId: this.resource.id,
          fileValue: this.imageFileValue as ReadStillImageExternalFileValue,
        })
      );
    } else {
      dialogRef = this._dialog.open<ReplaceFileDialogComponent, ReplaceFileDialogProps>(ReplaceFileDialogComponent, {
        data: {
          projectUuid: ProjectService.IriToUuid(this.resource.attachedToProject),
          title: 'Image',
          subtitle: 'Update image of the resource',
          representation: Constants.HasStillImageFileValue,
          propId: this.resource.properties[Constants.HasStillImageFileValue][0].id,
        },
      });
    }

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this._replaceFile(data);
      }
    });
  }

  openImageInNewTab(url: string) {
    window.open(url, '_blank');
  }

  setForbiddenStatus() {
    this.defaultFailureStatus = 403;
    this._onFailedImageLoad();
  }

  private _replaceFile(file: UpdateFileValue) {
    const updateRes = new UpdateResource();
    updateRes.id = this.resource.id;
    updateRes.type = this.resource.type;
    updateRes.property = Constants.HasStillImageFileValue;
    updateRes.value = file;
    this._dspApiConnection.v2.values
      .updateValue(updateRes as UpdateResource<UpdateFileValue>)
      .pipe(
        tap(res => {}),
        mergeMap(res => this._dspApiConnection.v2.values.getValue(this.resource.id, (res as WriteValueResponse).uuid))
      )
      .subscribe(res2 => {
        this._resourceFetcherService.reload();
      });
  }

  /**
   * opens the dialog to enter further properties for the region after it has been drawn and calls the function to upload the region after confirmation
   * @param startPoint the start point of the drawing
   * @param endPoint the end point of the drawing
   * @param imageSize the image size for calculations
   * @param overlay the overlay element that represents the region
   */
  private _openRegionDialog(startPoint: Point2D, endPoint: Point2D, imageSize: Point2D, overlay: Element): void {
    if (!this._viewer) {
      return;
    }
    this._dialog
      .open<AddRegionFormDialogComponent, AddRegionFormDialogProps>(AddRegionFormDialogComponent, {
        data: {
          resourceIri: this.resource.id,
        },
      })
      .afterClosed()
      .subscribe(data => {
        this._viewer!.removeOverlay(overlay);
        if (data) {
          this._uploadRegion(startPoint, endPoint, imageSize, data.color, data.comment, data.label);
        }
      });
  }

  /**
   * uploads the region after being prepared by the dialog
   * @param startPoint the start point of the drawing
   * @param endPoint the end point of the drawing
   * @param imageSize the image size for calculations
   * @param color the value for the color entered in the form
   * @param comment the value for the comment entered in the form
   * @param label the value for the label entered in the form
   */
  private _uploadRegion(
    startPoint: Point2D,
    endPoint: Point2D,
    imageSize: Point2D,
    color: string,
    comment: string,
    label: string
  ) {
    this._dspApiConnection.v2.res
      .createResource(
        StillImageHelper.getPayloadUploadRegion(
          this.resource.id,
          this.resource.attachedToProject,
          startPoint,
          endPoint,
          imageSize,
          color,
          comment,
          label
        )
      )
      .subscribe(res => {
        this._viewer.destroy(); // canvas-click event doesnt work anymore, is it viewer bug?
        this._setupViewer();
        this._loadImages();

        const regionId = (res as ReadResource).id;
        this._regionService.updateRegions();
        this._regionService.highlightRegion(regionId);
        this._regionService.showRegions(true);
      });
  }

  /**
   * set up function for the region drawer
   */
  private _addRegionDrawer() {
    // eslint-disable-next-line no-new
    new OpenSeadragon.MouseTracker({
      element: this._viewer.canvas,
      pressHandler: event => {
        if (!this.regionDrawMode) {
          return;
        }
        const overlayElement = this._renderer.createElement('div');
        overlayElement.style.background = 'rgba(255,0,0,0.3)';
        const viewportPos = this._viewer.viewport.pointFromPixel((event as OpenSeadragon.ViewerEvent).position);
        this._viewer.addOverlay(overlayElement, new OpenSeadragon.Rect(viewportPos.x, viewportPos.y, 0, 0));
        this._regionDragInfo = {
          overlayElement,
          startPos: viewportPos,
        };
      },
      dragHandler: event => {
        if (!this._regionDragInfo) {
          return;
        }
        const viewPortPos = this._viewer.viewport.pointFromPixel((event as OpenSeadragon.ViewerEvent).position);
        const diffX = viewPortPos.x - this._regionDragInfo.startPos.x;
        const diffY = viewPortPos.y - this._regionDragInfo.startPos.y;
        const location = new OpenSeadragon.Rect(
          Math.min(this._regionDragInfo.startPos.x, this._regionDragInfo.startPos.x + diffX),
          Math.min(this._regionDragInfo.startPos.y, this._regionDragInfo.startPos.y + diffY),
          Math.abs(diffX),
          Math.abs(diffY)
        );

        this._viewer.updateOverlay(this._regionDragInfo.overlayElement, location);
        this._regionDragInfo.endPos = viewPortPos;
      },
      releaseHandler: () => {
        if (this.regionDrawMode) {
          const imageSize = this._viewer.world.getItemAt(0).getContentSize();
          const startPoint = this._viewer.viewport.viewportToImageCoordinates(this._regionDragInfo.startPos);
          const endPoint = this._viewer.viewport.viewportToImageCoordinates(this._regionDragInfo.endPos);
          this._openRegionDialog(startPoint, endPoint, imageSize, this._regionDragInfo.overlayElement);
          this._regionDragInfo = null;
          this.regionDrawMode = false;
          this._viewer.setMouseNavEnabled(true);
        }
      },
    });
  }

  private _highlightRegion(regionIri: string) {
    const activeRegion: HTMLElement[] = this._regions[regionIri];

    if (activeRegion !== undefined) {
      for (const pol of activeRegion) {
        pol.setAttribute('class', 'region active');
      }
    }
  }

  private _unhighlightAllRegions() {
    for (const reg in this._regions) {
      if (reg in this._regions) {
        for (const pol of this._regions[reg]) {
          pol.setAttribute('class', 'region');
        }
      }
    }
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

    this._addRegionDrawer();
  }

  /**
   * adds all images in this.images to the _viewer.
   * Images are positioned in a horizontal row next to each other.
   */
  private _openInternalImages(): void {
    this.failedToLoad = false;

    const fileValues: ReadStillImageFileValue[] = [this.imageFileValue as ReadStillImageFileValue]; // TODO this was this.images.

    // display only the defined range of this.images
    const tileSources: object[] = StillImageHelper.prepareTileSourcesFromFileValues(fileValues, this.isPng);
    this._viewer.addOnceHandler('open', args => {
      // check if the current image exists
      if (
        this.imageFileValue instanceof ReadStillImageFileValue &&
        this.imageFileValue.fileUrl.includes(args.source['id'])
      ) {
        // enable mouse navigation incl. zoom
        this._viewer.setMouseNavEnabled(true);
        // enable the navigator
        this._viewer.navigator.element.style.display = 'block';
        this._regionService.imageIsLoaded();
      }
    });
    this._viewer.open(tileSources);
  }

  private _createSVGOverlay(
    regionIri: string,
    geometry: RegionGeometry,
    aspectRatio: number,
    regionLabel: string,
    regionComment: string
  ): void {
    const lineColor = geometry.lineColor;
    const lineWidth = geometry.lineWidth;

    const regEle: HTMLElement = this._renderer.createElement('div');
    regEle.id = `region-overlay-${Math.random() * 10000}`;
    regEle.className = 'region';
    regEle.setAttribute('style', `outline: solid ${lineColor} ${lineWidth}px;`);

    const diffX = geometry.points[1].x - geometry.points[0].x;
    const diffY = geometry.points[1].y - geometry.points[0].y;

    const loc = new OpenSeadragon.Rect(
      Math.min(geometry.points[0].x, geometry.points[0].x + diffX),
      Math.min(geometry.points[0].y, geometry.points[0].y + diffY),
      Math.abs(diffX),
      Math.abs(diffY * aspectRatio)
    );

    loc.y *= aspectRatio;

    this._viewer
      .addOverlay({
        element: regEle,
        location: loc,
      })
      .addHandler('canvas-click', event => {
        this._regionService.highlightRegion((<any>event).originalTarget.dataset.regionIri);
      });

    this._regions[regionIri].push(regEle);

    const comEle: HTMLElement = this._renderer.createElement('div');
    comEle.className = 'annotation-tooltip';
    comEle.innerHTML = `<strong>${regionLabel}</strong><br>${regionComment}`;
    regEle.append(comEle);

    regEle.addEventListener('mousemove', (event: MouseEvent) => {
      comEle.setAttribute('style', `display: block; left: ${event.clientX}px; top: ${event.clientY}px`);
    });
    regEle.addEventListener('mouseleave', () => {
      comEle.setAttribute('style', 'display: none');
    });
    regEle.dataset.regionIri = regionIri;
  }

  private _loadImages() {
    this._viewer?.close();
    this.resetStatus();

    if (this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageFileValue) {
      this._loadInternalImages();
    } else if (
      this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageExternalFileValue
    ) {
      this._loadExternalIIIF();
    }
  }

  private _loadInternalImages() {
    if (this.imageFileValue instanceof ReadStillImageFileValue) {
      this._rs
        .getFileInfo(this.imageFileValue?.fileUrl || '', this.imageFileValue?.filename)
        .pipe(take(1))
        .subscribe(
          () => {
            if (this.failedToLoad) {
              this._onSuccessAfterFailedImageLoad();
            }
            this._openInternalImages();
          },
          () => {
            this._onFailedImageLoad();
          }
        );
    }
  }

  private _loadExternalIIIF() {
    if (this.imageFileValue instanceof ReadStillImageExternalFileValue) {
      const iiif = IIIFUrl.createUrl(this.imageFileValue.externalUrl);
      if (iiif) {
        if (this.failedToLoad) {
          this._onSuccessAfterFailedImageLoad();
        }
        this._viewer?.open(iiif.infoJsonUrl);
      } else {
        this._onFailedImageLoad();
      }
    }
  }

  private _onFailedImageLoad() {
    this.failedToLoad = true;
    this._viewer.setMouseNavEnabled(false);
    this._viewer.navigator.element.style.display = 'none';
    this.regionDrawMode = false;
    this._viewer?.removeAllHandlers('open');
    this._cd.markForCheck();
  }

  private _onSuccessAfterFailedImageLoad() {
    this.failedToLoad = false;
    this._viewer.setMouseNavEnabled(true);
    this._viewer.navigator.element.style.display = 'block';
    this._regionService.imageIsLoaded();
  }

  private _renderRegions() {
    let imageXOffset = 0; // see documentation in this.openImages() for the usage of imageXOffset

    const stillImage = this.imageFileValue as ReadStillImageFileValue;
    const aspectRatio = stillImage.dimY / stillImage.dimX;

    const geometries = StillImageHelper.collectAndSortGeometries(this._regionService.regions, this._regions);

    // render all geometries for this page
    for (const geom of geometries) {
      const geometry = geom.geometry;

      const colorValues: ReadColorValue[] = geom.region.properties[Constants.HasColor] as ReadColorValue[];

      // if the geometry has a color property, use that value as the color for the line
      if (colorValues && colorValues.length) {
        geometry.lineColor = colorValues[0].color;
      }

      const commentValue = geom.region.properties[Constants.HasComment]
        ? geom.region.properties[Constants.HasComment][0].strval
        : '';

      if (!this.failedToLoad) {
        this._createSVGOverlay(geom.region.id, geometry, aspectRatio, geom.region.label, commentValue || '');
      }

      imageXOffset++;
    }
  }

  private _removeOverlays() {
    for (const reg in this._regions) {
      if (reg in this._regions) {
        for (const pol of this._regions[reg]) {
          if (pol instanceof HTMLElement) {
            pol.remove();
          }
        }
      }
    }

    this._regions = {};
    if (this._viewer) {
      this._viewer.clearOverlays();
    }
  }
}
