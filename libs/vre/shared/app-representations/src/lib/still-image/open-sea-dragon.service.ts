import { Injectable } from '@angular/core';
import { Point2D } from '@dasch-swiss/dsp-js';
import { AccessTokenService } from '@dasch-swiss/vre/shared/app-session';
import OpenSeadragon from 'openseadragon';
import { BehaviorSubject } from 'rxjs';
import { osdViewerConfig } from './osd-viewer.config';

interface Overlay {
  startPoint: Point2D;
  endPoint: Point2D;
  imageSize: Point2D;
  overlay: Element;
}

@Injectable({ providedIn: 'root' })
export class OpenSeaDragonService {
  get viewer() {
    return this._viewer;
  }

  private readonly _OVERLAY_COLOR = 'rgba(255,0,0,0.3)';
  private readonly ZOOM_FACTOR = 0.2;

  private _viewer!: OpenSeadragon.Viewer;

  private _overlay: {
    overlayElement: HTMLElement;
    startPos: OpenSeadragon.Point;
    endPos?: OpenSeadragon.Point;
  } | null = null;

  private _overlaySubject = new BehaviorSubject<Overlay | null>(null);
  overlay$ = this._overlaySubject.asObservable();

  constructor(private _accessToken: AccessTokenService) {}

  onInit(htmlElement: HTMLElement) {
    const viewerConfig: OpenSeadragon.Options = {
      ...osdViewerConfig,
      element: htmlElement,
      loadTilesWithAjax: true,
    };

    const accessToken = this._accessToken.getAccessToken();
    if (accessToken) {
      viewerConfig.ajaxHeaders = {
        Authorization: `Bearer ${accessToken}`,
      };
    }

    this._viewer = new OpenSeadragon.Viewer(viewerConfig);
    this._trackClickEvents(this._viewer);
  }

  zoom(direction: 1 | -1) {
    this._viewer.viewport.zoomBy(1 + direction * this.ZOOM_FACTOR);
  }

  private _trackClickEvents(viewer: OpenSeadragon.Viewer) {
    return new OpenSeadragon.MouseTracker({
      element: viewer.canvas,
      pressHandler: event => {
        if (viewer.isMouseNavEnabled()) {
          return;
        }

        const overlayElement: HTMLElement = document.createElement('div');
        overlayElement.style.background = this._OVERLAY_COLOR;
        const viewportPos = viewer.viewport.pointFromPixel((event as OpenSeadragon.ViewerEvent).position!);
        viewer.addOverlay(overlayElement, new OpenSeadragon.Rect(viewportPos.x, viewportPos.y, 0, 0));
        this._overlay = {
          overlayElement,
          startPos: viewportPos,
        };
      },
      dragHandler: event => {
        if (!this._overlay) {
          return;
        }

        const viewPortPos = viewer.viewport.pointFromPixel((event as OpenSeadragon.ViewerEvent).position!);
        const diffX = viewPortPos.x - this._overlay.startPos.x;
        const diffY = viewPortPos.y - this._overlay.startPos.y;
        const location = new OpenSeadragon.Rect(
          Math.min(this._overlay.startPos.x, this._overlay.startPos.x + diffX),
          Math.min(this._overlay.startPos.y, this._overlay.startPos.y + diffY),
          Math.abs(diffX),
          Math.abs(diffY)
        );

        viewer.updateOverlay(this._overlay.overlayElement, location);
        this._overlay.endPos = viewPortPos;
      },
      releaseHandler: () => {
        if (!this._overlay) {
          return;
        }
        const imageSize = viewer.world.getItemAt(0).getContentSize();
        const startPoint = viewer.viewport.viewportToImageCoordinates(this._overlay.startPos);
        const endPoint = viewer.viewport.viewportToImageCoordinates(this._overlay.endPos!);
        this._overlaySubject.next({ startPoint, endPoint, imageSize, overlay: this._overlay.overlayElement });
        this._overlay = null;
      },
    });
  }
}
