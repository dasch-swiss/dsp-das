import { Inject, Injectable, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Constants,
  KnoraApiConnection,
  Point2D,
  ReadColorValue,
  ReadResource,
  ReadStillImageFileValue,
  RegionGeometry,
} from '@dasch-swiss/dsp-js';
import { ReadStillImageExternalFileValue } from '@dasch-swiss/dsp-js/src/models/v2/resources/values/read/read-file-value';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import * as OpenSeadragon from 'openseadragon';
import { distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { AddRegionFormDialogComponent, AddRegionFormDialogProps } from '../add-region-form-dialog.component';
import { RegionService } from '../region.service';
import { StillImageHelper } from './still-image-helper';
import { PolygonsForRegion } from './still-image.component';

@Injectable()
export class OsdDrawerService {
  regionDrawMode = false; // stores whether viewer is currently drawing a region
  resource!: ReadResource;

  private _regionDragInfo: {
    overlayElement: HTMLElement;
    startPos: OpenSeadragon.Point;
    endPos?: OpenSeadragon.Point;
  } | null = null; // stores the information of the first click for drawing a region
  private _regions: PolygonsForRegion = {};

  public viewer!: OpenSeadragon.Viewer;

  private readonly _drawerColor = 'rgba(255,0,0,0.3)';

  // TODO copied from still-image.component.ts TO REMOVE!
  get imageFileValue(): ReadStillImageFileValue | ReadStillImageExternalFileValue | undefined {
    if (this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageFileValue) {
      return this.resource.properties[Constants.HasStillImageFileValue][0] as ReadStillImageFileValue;
    }
    if (this.resource.properties[Constants.HasStillImageFileValue][0].type === Constants.StillImageExternalFileValue) {
      return this.resource.properties[Constants.HasStillImageFileValue][0] as ReadStillImageExternalFileValue;
    } else return undefined;
  }

  constructor(
    private _renderer: Renderer2,
    private _regionService: RegionService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _dialog: MatDialog
  ) {}

  onInit(viewer: OpenSeadragon.Viewer, resource: ReadResource): void {
    this.resource = resource;
    this.viewer = viewer;
    this._regionService.imageIsLoaded$
      .pipe(
        filter(loaded => loaded),
        switchMap(() => this._regionService.showRegions$),
        distinctUntilChanged(),
        filter(() => !!this.viewer)
      )
      .subscribe(showRegion => {
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
    this.viewer.clearOverlays();
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

      // TODO before was if (!this.failedToLoad) {
      this._createSVGOverlay(geom.region.id, geometry, aspectRatio, geom.region.label, commentValue || '');

      imageXOffset++;
    }
  }

  private _createSVGOverlay(
    regionIri: string,
    geometry: RegionGeometry,
    aspectRatio: number,
    regionLabel: string,
    regionComment: string
  ): void {
    const viewer = this.viewer;
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

    viewer
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
    regEle.dataset['regionIri'] = regionIri;
  }

  /**
   * set up function for the region drawer
   */
  public addRegionDrawer(): void {
    const viewer = this.viewer;
    // eslint-disable-next-line no-new
    new OpenSeadragon.MouseTracker({
      element: viewer.canvas,
      pressHandler: event => {
        if (!this.regionDrawMode) {
          return;
        }
        const overlayElement: HTMLElement = this._renderer.createElement('div');
        overlayElement.style.background = this._drawerColor;
        const viewportPos = viewer.viewport.pointFromPixel((event as OpenSeadragon.ViewerEvent).position!);
        viewer.addOverlay(overlayElement, new OpenSeadragon.Rect(viewportPos.x, viewportPos.y, 0, 0));
        this._regionDragInfo = {
          overlayElement,
          startPos: viewportPos,
        };
      },
      dragHandler: event => {
        if (!this._regionDragInfo) {
          return;
        }
        const viewPortPos = viewer.viewport.pointFromPixel((event as OpenSeadragon.ViewerEvent).position!);
        const diffX = viewPortPos.x - this._regionDragInfo.startPos.x;
        const diffY = viewPortPos.y - this._regionDragInfo.startPos.y;
        const location = new OpenSeadragon.Rect(
          Math.min(this._regionDragInfo.startPos.x, this._regionDragInfo.startPos.x + diffX),
          Math.min(this._regionDragInfo.startPos.y, this._regionDragInfo.startPos.y + diffY),
          Math.abs(diffX),
          Math.abs(diffY)
        );

        viewer.updateOverlay(this._regionDragInfo.overlayElement, location);
        this._regionDragInfo.endPos = viewPortPos;
      },
      releaseHandler: () => {
        if (this.regionDrawMode && this._regionDragInfo) {
          const imageSize = viewer.world.getItemAt(0).getContentSize();
          const startPoint = viewer.viewport.viewportToImageCoordinates(this._regionDragInfo.startPos);
          const endPoint = viewer.viewport.viewportToImageCoordinates(this._regionDragInfo.endPos!);
          this._openRegionDialog(startPoint, endPoint, imageSize, this._regionDragInfo.overlayElement);
          this._regionDragInfo = null;
          this.regionDrawMode = false;
          viewer.setMouseNavEnabled(true);
        }
      },
    });
  }

  private _openRegionDialog(startPoint: Point2D, endPoint: Point2D, imageSize: Point2D, overlay: Element): void {
    this._dialog
      .open<AddRegionFormDialogComponent, AddRegionFormDialogProps>(AddRegionFormDialogComponent, {
        data: {
          resourceIri: this.resource.id,
        },
      })
      .afterClosed()
      .subscribe(data => {
        this.viewer.removeOverlay(overlay);
        if (data) {
          this._uploadRegion(startPoint, endPoint, imageSize, data.color, data.comment, data.label);
        }
      });
  }

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
        this.viewer.destroy(); // canvas-click event doesnt work anymore, is it viewer bug?
        // TODO RELOAD HERE
        /** BEFORE WAS
                 this._setupViewer();
                 this._loadImages();
                 */
        const regionId = (res as ReadResource).id;
        this._regionService.updateRegions();
        this._regionService.highlightRegion(regionId);
        this._regionService.showRegions(true);
      });
  }

  private _highlightRegion(regionIri: string) {
    const activeRegions: HTMLElement[] = this._regions[regionIri];

    if (activeRegions !== undefined) {
      for (const pol of activeRegions) {
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
}
