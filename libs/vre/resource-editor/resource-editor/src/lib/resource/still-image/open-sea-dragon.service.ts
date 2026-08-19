import { Injectable } from '@angular/core';
import { Point2D } from '@dasch-swiss/dsp-js';
import { AccessTokenService } from '@dasch-swiss/vre/core/session';
import OpenSeadragon from 'openseadragon';
import { Subject } from 'rxjs';
import { osdViewerConfig } from './osd-viewer.config';
import { StillImageHelper } from './still-image-helper';

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
  private readonly _ZOOM_FACTOR = 0.2;

  private _viewer!: OpenSeadragon.Viewer;

  private _drawing = false;

  private _wheelZoomEnabled = false;

  get drawing() {
    return this._drawing;
  }

  private _rectangleInDrawing: {
    overlayElement: HTMLElement;
    startPos: OpenSeadragon.Point;
    endPos?: OpenSeadragon.Point;
  } | null = null;

  private _createdRectangleSubject = new Subject<Overlay>();
  createdRectangle$ = this._createdRectangleSubject.asObservable();

  constructor(private readonly _accessToken: AccessTokenService) {}

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
    this._addCustomHandlers(this._viewer);
    this._gateWheelZoomBehindInteraction(this._viewer);
  }

  toggleDrawing(): void {
    this._drawing = !this._drawing;

    if (this._drawing) {
      this._disableDefaultDragging();
      this._disableDoubleClickZooming();
    } else {
      this._enableDefaultDragging();
      this._enableDoubleClickZooming();
    }
  }

  private _disableDefaultDragging(): void {
    this._viewer.addHandler('canvas-drag', StillImageHelper.preventDefault);
  }

  private _disableDoubleClickZooming(): void {
    this._viewer.addHandler('canvas-double-click', StillImageHelper.preventDefault);
  }

  private _enableDefaultDragging(): void {
    this._viewer.removeHandler('canvas-drag', StillImageHelper.preventDefault);
  }

  private _enableDoubleClickZooming(): void {
    this._viewer.removeHandler('canvas-double-click', StillImageHelper.preventDefault);
  }

  zoom(direction: 1 | -1) {
    this._viewer.viewport.zoomBy(1 + direction * this._ZOOM_FACTOR);
  }

  /**
   * Keeps the wheel available to the resource page until the user actually works with the image.
   *
   * OpenSeadragon consumes every wheel event over its canvas in order to zoom, which left the
   * resource page unscrollable by mouse whenever the pointer sat over the image (DEV-6998). A
   * pointer press inside the viewer enables wheel zooming, a press anywhere else disables it again,
   * so the zoom gesture itself is unchanged for anyone who is looking at the image.
   *
   * The wheel listener runs in the capture phase on the viewer's outer element so that
   * `stopPropagation()` keeps the event away from OpenSeadragon's own listener on the inner canvas —
   * and away from its scroll throttle, which calls `preventDefault()` on the events it skips and
   * would otherwise make the page scroll stutter. The default action is deliberately left intact,
   * because the default *is* the page scroll.
   */
  private _gateWheelZoomBehindInteraction(viewer: OpenSeadragon.Viewer): void {
    const onPressOutside = (event: PointerEvent) => {
      this._wheelZoomEnabled = viewer.element.contains(event.target as Node);
    };
    document.addEventListener('pointerdown', onPressOutside);
    viewer.addOnceHandler('destroy', () => document.removeEventListener('pointerdown', onPressOutside));

    viewer.element.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        // Fullscreen has no page left to scroll, so the wheel keeps zooming there unconditionally.
        if (!this._wheelZoomEnabled && !viewer.isFullPage()) {
          event.stopPropagation();
        }
      },
      { capture: true }
    );
  }

  private _addCustomHandlers(viewer: OpenSeadragon.Viewer): void {
    viewer.addHandler('canvas-press', event => this._onCanvasPress(event, viewer));
    viewer.addHandler('canvas-drag', event => this._onCanvasDrag(event, viewer));
    viewer.addHandler('canvas-release', () => this._onCanvasRelease(viewer));
  }

  private _onCanvasPress(event: OpenSeadragon.CanvasEvent, viewer: OpenSeadragon.Viewer): void {
    if (!this._drawing) {
      return;
    }
    const overlayElement: HTMLElement = document.createElement('div');
    overlayElement.style.background = this._OVERLAY_COLOR;
    const viewportPos = viewer.viewport.pointFromPixel(event.position);
    viewer.addOverlay(overlayElement, new OpenSeadragon.Rect(viewportPos.x, viewportPos.y, 0, 0));
    this._rectangleInDrawing = {
      overlayElement,
      startPos: viewportPos,
    };
  }

  private _onCanvasDrag(event: OpenSeadragon.CanvasEvent, viewer: OpenSeadragon.Viewer): void {
    if (!this._drawing || !this._rectangleInDrawing) {
      return;
    }
    const viewPortPos = viewer.viewport.pointFromPixel(event.position);
    const diffX = viewPortPos.x - this._rectangleInDrawing.startPos.x;
    const diffY = viewPortPos.y - this._rectangleInDrawing.startPos.y;
    const location = new OpenSeadragon.Rect(
      Math.min(this._rectangleInDrawing.startPos.x, this._rectangleInDrawing.startPos.x + diffX),
      Math.min(this._rectangleInDrawing.startPos.y, this._rectangleInDrawing.startPos.y + diffY),
      Math.abs(diffX),
      Math.abs(diffY)
    );

    viewer.updateOverlay(this._rectangleInDrawing.overlayElement, location);
    this._rectangleInDrawing.endPos = viewPortPos;
  }

  private _onCanvasRelease(viewer: OpenSeadragon.Viewer): void {
    if (!this._drawing || !this._rectangleInDrawing?.endPos) {
      return;
    }

    const imageSize = viewer.world.getItemAt(0).getContentSize();
    const startPoint = viewer.viewport.viewportToImageCoordinates(this._rectangleInDrawing.startPos);
    const endPoint = viewer.viewport.viewportToImageCoordinates(this._rectangleInDrawing.endPos);
    this._createdRectangleSubject.next({
      startPoint,
      endPoint,
      imageSize,
      overlay: this._rectangleInDrawing.overlayElement,
    });
    this._rectangleInDrawing = null;
    this.toggleDrawing();
  }
}
