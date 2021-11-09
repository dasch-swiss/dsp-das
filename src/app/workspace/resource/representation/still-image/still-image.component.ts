import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
    Constants, CreateColorValue, CreateGeomValue, CreateLinkValue,
    CreateResource, CreateTextValueAsString, KnoraApiConnection,
    Point2D, ReadColorValue, ReadFileValue,
    ReadGeomValue,
    ReadResource,
    ReadStillImageFileValue,
    ReadValue,
    RegionGeometry
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';
import { DspCompoundPosition } from '../../dsp-resource';
import { FileRepresentation } from '../file-representation';
import * as OpenSeadragon from 'openseadragon';


/**
 * represents a region resource.
 */
export class Region {

    /**
     *
     * @param regionResource a resource of type Region
     */
    constructor(readonly regionResource: ReadResource) {

    }

    /**
     * get all geometry information belonging to this region.
     *
     */
    getGeometries() {
        return this.regionResource.properties[Constants.HasGeometry] as ReadGeomValue[];
    }
}

/**
 * represents a still image file value including its regions.
 */
export class StillImageRepresentation {

    /**
     *
     * @param stillImageFileValue a [[ReadStillImageFileValue]] representing an image.
     * @param regions the regions belonging to the image.
     */
    constructor(readonly stillImageFileValue: ReadStillImageFileValue, readonly regions: Region[]) {

    }

}

/**
 * represents a geometry belonging to a specific region resource.
 */
export class GeometryForRegion {

    /**
     *
     * @param geometry the geometrical information.
     * @param region the region the geometry belongs to.
     */
    constructor(readonly geometry: RegionGeometry, readonly region: ReadResource) {
    }

}

/**
 * collection of `SVGPolygonElement` for individual regions.
 */
interface PolygonsForRegion {

    [key: string]: HTMLDivElement[];

}

@Component({
    selector: 'app-still-image',
    templateUrl: './still-image.component.html',
    styleUrls: ['./still-image.component.scss']
})
export class StillImageComponent implements OnChanges, OnDestroy {

    @Input() images: FileRepresentation[];
    @Input() imageCaption?: string;
    @Input() resourceIri: string;
    @Input() project: string;
    @Input() activateRegion?: string; // highlight a region
    @Input() compoundNavigation?: DspCompoundPosition;
    @Input() currentTab: string;

    @Output() goToPage = new EventEmitter<number>();

    @Output() regionClicked = new EventEmitter<string>();

    @Output() regionAdded = new EventEmitter<string>();

    regionDrawMode: Boolean = false; // stores whether viewer is currently drawing a region
    private _regionDragInfo; // stores the information of the first click for drawing a region
    private _viewer: OpenSeadragon.Viewer;
    private _regions: PolygonsForRegion = {};

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection, private _elementRef: ElementRef, private _dialog: MatDialog, private _errorHandler: ErrorHandlerService
    ) {
        OpenSeadragon.setString('Tooltips.Home', '');
        OpenSeadragon.setString('Tooltips.ZoomIn', '');
        OpenSeadragon.setString('Tooltips.ZoomOut', '');
        OpenSeadragon.setString('Tooltips.FullPage', '');
    }
    /**
     * calculates the surface of a rectangular region.
     *
     * @param geom the region's geometry.
     * @returns the surface.
     */
    static surfaceOfRectangularRegion(geom: RegionGeometry): number {

        if (geom.type !== 'rectangle') {
            // console.log('expected rectangular region, but ' + geom.type + ' given');
            return 0;
        }

        const w = Math.max(geom.points[0].x, geom.points[1].x) - Math.min(geom.points[0].x, geom.points[1].x);
        const h = Math.max(geom.points[0].y, geom.points[1].y) - Math.min(geom.points[0].y, geom.points[1].y);

        return w * h;

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['images'] && changes['images'].isFirstChange()) {
            this._setupViewer();
        }
        if (changes['images']) {
            this._openImages();
            this._unhighlightAllRegions();
            // tODO: check if this is necessary or could be handled below
            //  (remove the 'else' before the 'if', so changes['activateRegion'] is always checked for)
            if (this.activateRegion !== undefined) {
                this._highlightRegion(this.activateRegion);
            }
            if (this.currentTab === 'annotations') {
                this.renderRegions();
            }
        } else if (changes['activateRegion']) {
            this._unhighlightAllRegions();
            if (this.activateRegion !== undefined) {
                this._highlightRegion(this.activateRegion);
            }
        }
    }

    ngOnDestroy() {
        if (this._viewer) {
            this._viewer.destroy();
            this._viewer = undefined;
        }
    }

    /**
     * renders all ReadStillImageFileValues to be found in [[this.images]].
     * (Although this.images is a Angular Input property, the built-in change detection of Angular does not detect changes in complex objects or arrays, only reassignment of objects/arrays.
     * Use this method if additional ReadStillImageFileValues were added to this.images after creation/assignment of the this.images array.)
     */
    updateImages() {
        if (!this._viewer) {
            this._setupViewer();
        }
        this._openImages();
    }

    /**
     * renders all regions to be found in [[this.images]].
     * (Although this.images is a Angular Input property, the built-in change detection of Angular does not detect changes in complex objects or arrays, only reassignment of objects/arrays.
     * Use this method if additional regions were added to the resources.images)
     */
    updateRegions() {
        if (!this._viewer) {
            this._setupViewer();
        }
        this.renderRegions();
    }

    /**
     * when the draw region button is clicked, this method is called from the html. It sets the draw mode to true and
     * prevents navigation by mouse (so that the region can be accurately drawn).
     */
    drawButtonClicked(): void {

        this.regionDrawMode = true;
        this._viewer.setMouseNavEnabled(false);
    }

    /**
     * adds a ROI-overlay to the viewer for every region of every image in this.images
     */
    renderRegions(): void {
        /**
         * sorts rectangular regions by surface, so all rectangular regions are clickable.
         * Non-rectangular regions are ignored.
         *
         * @param geom1 first region.
         * @param geom2 second region.
         */
        const sortRectangularRegion = (geom1: GeometryForRegion, geom2: GeometryForRegion) => {

            if (geom1.geometry.type === 'rectangle' && geom2.geometry.type === 'rectangle') {

                const surf1 = StillImageComponent.surfaceOfRectangularRegion(geom1.geometry);
                const surf2 = StillImageComponent.surfaceOfRectangularRegion(geom2.geometry);

                // if reg1 is smaller than reg2, return 1
                // reg1 then comes after reg2 and thus is rendered later
                if (surf1 < surf2) {
                    return 1;
                } else {
                    return -1;
                }

            } else {
                return 0;
            }

        };

        this.removeOverlays();

        let imageXOffset = 0; // see documentation in this.openImages() for the usage of imageXOffset

        for (const image of this.images) {

            const stillImage = image.fileValue as ReadStillImageFileValue;
            const aspectRatio = (stillImage.dimY / stillImage.dimX);

            // collect all geometries belonging to this page
            const geometries: GeometryForRegion[] = [];
            image.annotations.map((reg) => {

                this._regions[reg.regionResource.id] = [];
                const geoms = reg.getGeometries();

                geoms.map((geom) => {
                    const geomForReg = new GeometryForRegion(geom.geometry, reg.regionResource);

                    geometries.push(geomForReg);
                });
            });

            // sort all geometries belonging to this page
            geometries.sort(sortRectangularRegion);

            // render all geometries for this page
            for (const geom of geometries) {

                const geometry = geom.geometry;

                const colorValues: ReadColorValue[] = geom.region.properties[Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasColor'] as ReadColorValue[];

                // if the geometry has a color property, use that value as the color for the line
                if(colorValues && colorValues.length){
                    geometry.lineColor = colorValues[0].color;
                }

                this._createSVGOverlay(geom.region.id, geometry, aspectRatio, imageXOffset, geom.region.label);

            }

            imageXOffset++;
        }

    }

    /**
     * removes SVG overlays from the DOM.
     */
    removeOverlays() {
        for (const reg in this._regions) {
            if (this._regions.hasOwnProperty(reg)) {
                for (const pol of this._regions[reg]) {
                    if (pol instanceof HTMLDivElement) {
                        pol.remove();
                    }
                }
            }
        }

        this._regions = {};

        this._viewer.clearOverlays();
    }

    /**
     * opens the dialog to enter further properties for the region after it has been drawn and calls the function to upload the region after confirmation
     * @param startPoint the start point of the drawing
     * @param endPoint the end point of the drawing
     * @param imageSize the image size for calculations
     */
    private _openRegionDialog(startPoint: Point2D, endPoint: Point2D, imageSize: Point2D, overlay: Element): void{
        const dialogConfig: MatDialogConfig = {
            width: '337px',
            maxHeight: '80vh',
            position: {
                top: '112px'
            },
            data: { mode: 'addRegion', title: 'Create a region', subtitle: 'Add further properties', id: this.resourceIri },
            disableClose: true
        };
        const dialogRef = this._dialog.open(
            DialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe((data) => {
            // remove the drawn rectangle as either the cancel button was clicked or the region will be displayed
            this._viewer.removeOverlay(overlay);
            if (data) { // data is null if the cancel button was clicked
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
    private _uploadRegion(startPoint: Point2D, endPoint: Point2D, imageSize: Point2D, color: string, comment: string, label: string){
        const x1 = Math.max(Math.min(startPoint.x, imageSize.x), 0)/imageSize.x;
        const x2 = Math.max(Math.min(endPoint.x, imageSize.x), 0)/imageSize.x;
        const y1 = Math.max(Math.min(startPoint.y, imageSize.y), 0)/imageSize.y;
        const y2 = Math.max(Math.min(endPoint.y, imageSize.y), 0)/imageSize.y;
        const geomStr = '{"status":"active","lineColor":"' + color + '","lineWidth":2,"points":[{"x":' +  x1.toString() +
            ',"y":' + y1.toString() + '},{"x":' + x2.toString() + ',"y":' + y2.toString()+ '}],"type":"rectangle"}';
        const createResource = new CreateResource();
        createResource.label = label;
        createResource.type = Constants.KnoraApiV2 + Constants.HashDelimiter + 'Region';
        createResource.attachedToProject = this.project;
        const geomVal = new CreateGeomValue();
        geomVal.type = Constants.GeomValue;
        geomVal.geometryString = geomStr;
        const colorVal = new CreateColorValue();
        colorVal.type = Constants.ColorValue;
        colorVal.color = color;
        const linkVal = new CreateLinkValue();
        linkVal.type = Constants.LinkValue;
        linkVal.linkedResourceIri = this.resourceIri;
        const commentVal = new CreateTextValueAsString();
        commentVal.type = Constants.TextValue;
        commentVal.text = comment;

        createResource.properties = {
            [Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasComment']: [commentVal],
            [Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasColor'] : [colorVal],
            [Constants.KnoraApiV2 + Constants.HashDelimiter + 'isRegionOfValue'] : [linkVal],
            [Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasGeometry'] : [geomVal]
        };
        this._dspApiConnection.v2.res.createResource(createResource).subscribe(
            (res: ReadResource) => {
                this.regionAdded.emit(res.id);
            },
            (error) => {
                this._errorHandler.showMessage(error);
            }
        );
    }

    /**
     * set up function for the region drawer
     */
    private _addRegionDrawer(){
        new OpenSeadragon.MouseTracker({
            element: this._viewer.canvas,
            pressHandler: (event) => {
                if (!this.regionDrawMode){
                    return;
                }
                const overlayElement = document.createElement('div');
                overlayElement.style.background = 'rgba(255,0,0,0.3)';
                const viewportPos = this._viewer.viewport.pointFromPixel((event as OpenSeadragon.ViewerEvent).position);
                this._viewer.addOverlay(overlayElement, new OpenSeadragon.Rect(viewportPos.x, viewportPos.y, 0, 0));
                this._regionDragInfo = {
                    overlayElement: overlayElement,
                    startPos: viewportPos
                };
            },
            dragHandler: (event) => {
                if (!this._regionDragInfo){
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
                    const imageSize =  this._viewer.world.getItemAt(0).getContentSize();
                    const startPoint  = this._viewer.viewport.viewportToImageCoordinates(this._regionDragInfo.startPos);
                    const endPoint = this._viewer.viewport.viewportToImageCoordinates(this._regionDragInfo.endPos);
                    this._openRegionDialog(startPoint, endPoint, imageSize, this._regionDragInfo.overlayElement);
                    this._regionDragInfo = null;
                    this.regionDrawMode = false;
                    this._viewer.setMouseNavEnabled(true);
                }
            }
        });
    }

    /**
     * highlights the polygon elements associated with the given region.
     *
     * @param regionIri the Iri of the region whose polygon elements should be highlighted..
     */
    private _highlightRegion(regionIri) {

        const activeRegion: HTMLDivElement[] = this._regions[regionIri];

        if (activeRegion !== undefined) {
            for (const pol of activeRegion) {
                pol.setAttribute('class', 'region active');
            }
        }
    }

    /**
     * unhighlights the polygon elements of all regions.
     *
     */
    private _unhighlightAllRegions() {

        for (const reg in this._regions) {
            if (this._regions.hasOwnProperty(reg)) {
                for (const pol of this._regions[reg]) {
                    pol.setAttribute('class', 'region');
                }
            }
        }
    }

    /**
     * initializes the OpenSeadragon _viewer
     */
    private _setupViewer(): void {
        const viewerContainer = this._elementRef.nativeElement.getElementsByClassName('osd-container')[0];
        const osdOptions = {
            element: viewerContainer,
            sequenceMode: false,
            showReferenceStrip: true,
            zoomInButton: 'DSP_OSD_ZOOM_IN',
            zoomOutButton: 'DSP_OSD_ZOOM_OUT',
            previousButton: 'DSP_OSD_PREV_PAGE',
            nextButton: 'DSP_OSD_NEXT_PAGE',
            homeButton: 'DSP_OSD_HOME',
            fullPageButton: 'DSP_OSD_FULL_PAGE',
            // rotateLeftButton: 'DSP_OSD_ROTATE_LEFT',        // doesn't work yet
            // rotateRightButton: 'DSP_OSD_ROTATE_RIGHT',       // doesn't work yet
            showNavigator: true,
            navigatorPosition: 'ABSOLUTE' as const,
            navigatorTop: '40px',
            navigatorLeft: 'calc(100% - 160px)',
            navigatorHeight: '120px',
            navigatorWidth: '120px',
            gestureSettingsMouse: {
                clickToZoom: false // do not zoom in on click
            }
        };
        this._viewer = new OpenSeadragon.Viewer(osdOptions);

        this._viewer.addHandler('full-screen', (args) => {
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
    private _openImages(): void {
        // imageXOffset controls the x coordinate of the left side of each image in the OpenSeadragon viewport coordinate system.
        // the first image has its left side at x = 0, and all images are scaled to have a width of 1 in viewport coordinates.
        // see also: https://openseadragon.github.io/examples/viewport-coordinates/

        const fileValues: ReadFileValue[] = this.images.map(
            (img) => (img.fileValue)
        );

        // display only the defined range of this.images
        const tileSources: object[] = this._prepareTileSourcesFromFileValues(fileValues);

        this.removeOverlays();
        this._viewer.open(tileSources);

    }

    /**
     * prepare tile sources from the given sequence of [[ReadFileValue]].
     *
     * @param imagesToDisplay the given file values to de displayed.
     * @returns the tile sources to be passed to OSD _viewer.
     */
    private _prepareTileSourcesFromFileValues(imagesToDisplay: ReadFileValue[]): object[] {
        const images = imagesToDisplay as ReadStillImageFileValue[];

        let imageXOffset = 0;
        const imageYOffset = 0;
        const tileSources = [];

        for (const image of images) {
            const sipiBasePath = image.iiifBaseUrl + '/' + image.filename;
            const width = image.dimX;
            const height = image.dimY;

            // construct OpenSeadragon tileSources according to https://openseadragon.github.io/docs/OpenSeadragon.Viewer.html#open
            tileSources.push({
                // construct IIIF tileSource configuration according to
                // http://iiif.io/api/image/2.1/#technical-properties
                // see also http://iiif.io/api/image/2.0/#a-implementation-notes
                tileSource: {
                    '@context': 'http://iiif.io/api/image/2/context.json',
                    '@id': sipiBasePath,
                    height: height,
                    width: width,
                    profile: ['http://iiif.io/api/image/2/level2.json'],
                    protocol: 'http://iiif.io/api/image',
                    tiles: [{
                        scaleFactors: [1, 2, 4, 8, 16, 32],
                        width: 1024
                    }]
                },
                x: imageXOffset,
                y: imageYOffset
            });

            imageXOffset++;
        }

        return tileSources;
    }

    /**
     * creates and adds a ROI-overlay to the viewer
     * @param regionIri the Iri of the region.
     * @param geometry - the geometry describing the ROI
     * @param aspectRatio -  the aspectRatio (h/w) of the image on which the geometry should be placed
     * @param xOffset -  the x-offset in Openseadragon viewport coordinates of the image on which the geometry should be placed
     * @param toolTip -  the tooltip which should be displayed on mousehover of the svg element
     */
    private _createSVGOverlay(regionIri: string, geometry: RegionGeometry, aspectRatio: number, xOffset: number, toolTip: string): void {
        const lineColor = geometry.lineColor;
        const lineWidth = geometry.lineWidth;

        const elt = document.createElement('div');
        elt.id = 'region-overlay-' + Math.random() * 10000;
        elt.className = 'region';
        elt.title = toolTip;
        elt.setAttribute('style', 'outline: solid ' + lineColor + ' ' + lineWidth + 'px;');

        elt.addEventListener('click', (event: MouseEvent) => {
            this.regionClicked.emit(regionIri);
        }, false);

        const diffX = geometry.points[1].x - geometry.points[0].x;
        const diffY = geometry.points[1].y - geometry.points[0].y;

        const loc = new OpenSeadragon.Rect(
            Math.min(geometry.points[0].x, geometry.points[0].x + diffX),
            Math.min(geometry.points[0].y, geometry.points[0].y + diffY),
            Math.abs(diffX),
            Math.abs(diffY * aspectRatio));

        loc.y = loc.y * aspectRatio;

        this._viewer.addOverlay({
            element: elt,
            location: loc
        });

        this._regions[regionIri].push(elt);
    }

}
