import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { Point2D, ReadStillImageFileValue, ReadResource } from '@dasch-swiss/dsp-js';
import { ReadFileValue } from '@dasch-swiss/dsp-js/src/models/v2/resources/values/read/read-file-value';
import { RegionService } from '@dsp-app/src/app/workspace/resource/representation/still-image_/region.service';
import * as OpenSeadragon from 'openseadragon';
import { Options, Rect } from 'openseadragon';

export interface ReadStillImageExternalFileValue extends ReadFileValue {
  dimX: number;
  dimY: number;
  iiifBaseUrl: string;
}

export class RegionElement {
  constructor(
    private _startPoint: Point2D,
    private _overlay: HTMLElement,
    private _endPoint = new Point2D(0, 0),
    private _imageSize = new Point2D(0, 0)
  ) {}

  get overlay() {
    return this._overlay;
  }

  get startPoint() {
    return this._startPoint;
  }

  get endPoint() {
    return this._endPoint;
  }

  set endPoint(val: Point2D) {
    this._endPoint = val;
  }

  get imageSize() {
    return this._imageSize;
  }

  set imageSize(val: Point2D) {
    this._imageSize = val;
  }

  get surface() {
    const w = Math.max(this._startPoint.x, this._endPoint.x) - Math.min(this._startPoint.x, this._endPoint.x);
    const h = Math.max(this._startPoint.y, this._endPoint.y) - Math.min(this._startPoint.y, this._endPoint.y);
    return w * h;
  }

  get osdRectangle(): Rect {
    const diffX = this._endPoint.x - this._startPoint.x;
    const diffY = this._endPoint.y - this._startPoint.y;
    return new OpenSeadragon.Rect(
      Math.min(this._startPoint.x, this._startPoint.x + diffX),
      Math.min(this._startPoint.y, this._startPoint.y + diffY),
      Math.abs(diffX),
      Math.abs(diffY)
    );
  }
}

@Component({
  selector: 'app-osd-viewer',
  templateUrl: './osd-viewer.component.html',
  styleUrls: ['./osd-viewer.component.scss'],
})
export class OsdViewerComponent implements OnInit, OnChanges {
  @Input() image: ReadStillImageFileValue | ReadStillImageExternalFileValue;

  @Input() draw: boolean = false;

  @Input() regions: RegionElement[];

  @Input() selectedRegion: string;

  @Output() regionUpdate = new EventEmitter<RegionElement>();

  private _selectedRegion: RegionElement | undefined = undefined;

  private _viewer: OpenSeadragon.Viewer;

  private readonly osdOptions: Options = {
    gestureSettingsMouse: {
      clickToZoom: false,
      dblClickToZoom: true,
      flickEnabled: true,
    },
    sequenceMode: false,
    showReferenceStrip: true,
    zoomInButton: 'DSP_OSD_ZOOM_IN',
    zoomOutButton: 'DSP_OSD_ZOOM_OUT',
    previousButton: 'DSP_OSD_PREV_PAGE',
    nextButton: 'DSP_OSD_NEXT_PAGE',
    homeButton: 'DSP_OSD_HOME',
    fullPageButton: 'DSP_OSD_FULL_PAGE',
    showNavigator: true,
    visibilityRatio: 1.0,
  };

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _regionService: RegionService
  ) {}

  ngOnInit() {
    this._initOsdViewer();
    this._addFullscreenHandler();
    this._addRegionHandlers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['draw']) {
      this._viewer.setMouseNavEnabled(this.draw);
    }

    if (changes['selectedRegion']) {
      this._selectedRegion = this.regions.find(r => r.overlay.id === this.selectedRegion);
    }
  }

  private _initOsdViewer(): void {
    this.osdOptions.element = this._elementRef.nativeElement.getElementsByClassName('osd-container')[0];
    this._viewer = new OpenSeadragon.Viewer(this.osdOptions);
  }

  private _addFullscreenHandler() {
    this._viewer.addHandler('full-screen', args => {
      if (args.fullScreen) {
        this.osdOptions.element.classList.add('fullscreen');
      } else {
        this.osdOptions.element.classList.remove('fullscreen');
      }
    });
  }

  private _addRegionHandlers(): void {
    // eslint-disable-next-line no-new
    new OpenSeadragon.MouseTracker({
      element: this._viewer.canvas,
      pressHandler: event => this.pressHandler(event),
      dragHandler: event => this.dragHandler(event),
      releaseHandler: () => this.releaseHandler(),
    });
  }

  private pressHandler(event: OpenSeadragon.ViewerEvent): void {
    if (!this.draw) {
      return;
    }
    const startPoint = this._viewer.viewport.pointFromPixel(event.position);

    const overlay = this._renderer.createElement('div');
    overlay.style.background = 'rgba(255,0,0,0.3)';

    this._selectedRegion = new RegionElement(startPoint, overlay);
    this._viewer.addOverlay(overlay, new OpenSeadragon.Rect(startPoint.x, startPoint.y, 0, 0));
  }

  private dragHandler(event: OpenSeadragon.ViewerEvent): void {
    if (!this.draw) {
      return;
    }
    this._selectedRegion.endPoint = this._viewer.viewport.pointFromPixel(event.position);
    this._viewer.updateOverlay(this._selectedRegion.overlay, this._selectedRegion.osdRectangle);
  }

  private releaseHandler(): void {
    if (!this.draw) {
      return;
    }
    this._selectedRegion.imageSize = this._viewer.world.getItemAt(0).getContentSize();
    this.selectedRegion = null;
    this.regionUpdate.emit(this._selectedRegion);
    this._viewer.setMouseNavEnabled(true);
  }

  private _getOsdRectangle(startPoint: Point2D, endPoint: Point2D): Rect {
    const diffX = endPoint.x - startPoint.x;
    const diffY = endPoint.y - startPoint.y;
    return new OpenSeadragon.Rect(
      Math.min(startPoint.x, startPoint.x + diffX),
      Math.min(startPoint.y, startPoint.y + diffY),
      Math.abs(diffX),
      Math.abs(diffY)
    );
  }
}
