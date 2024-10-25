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
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RegionService } from '../region.service';
import { IIIFUrl } from '../third-party-iiif/third-party-iiif';
import { OpenSeaDragonService } from './open-sea-dragon.service';
import { OsdDrawerService } from './osd-drawer.service';
import { StillImageHelper } from './still-image-helper';

@Component({
  selector: 'app-still-image',
  template: ` <div
      class="osd-container"
      [class.drawing]="isViewInitialized && !osdDrawerService.viewer.isMouseNavEnabled()"
      #osdViewer>
      <ng-content select="[navigationArrows]"></ng-content>
    </div>

    <div class="toolbar">
      <ng-content select="[slider]" />
      <app-still-image-toolbar
        *ngIf="isViewInitialized"
        [resource]="resource"
        [viewer]="osd.viewer"
        [isPng]="settings.imageFormatIsPng.value"
        (imageIsPng)="(isPng$)" />
    </div>`,
  styleUrls: ['./still-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OsdDrawerService, OpenSeaDragonService],
})
export class StillImageComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) resource!: ReadResource;
  @ViewChild('osdViewer') osdViewerElement!: ElementRef;

  isViewInitialized = false;
  private _ngUnsubscribe = new Subject<void>();
  settings = { imageFormatIsPng: new BehaviorSubject(false) };

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
    this.osdDrawerService.trackClickEvents();

    this.osd.viewer.addHandler('open', () => {
      this._region.imageIsLoaded();
    });

    this.settings.imageFormatIsPng
      .asObservable()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(() => {
        this._loadImages();
        this._cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.osd.viewer.destroy();
    this._ngUnsubscribe.complete();
  }

  private _loadImages() {
    const image = this.resource.properties[Constants.HasStillImageFileValue][0];

    switch (image.type) {
      case Constants.StillImageFileValue:
        this._openInternalImage(image as ReadStillImageFileValue);
        break;
      case Constants.StillImageExternalFileValue:
        this._openExternal3iFImage(image as ReadStillImageExternalFileValue);
        break;
      default:
        throw new AppError('Unknown image type');
    }
  }

  private _openInternalImage(image: ReadStillImageFileValue): void {
    const tiles = StillImageHelper.prepareTileSourcesFromFileValues([image], this.settings.imageFormatIsPng.value);
    this.osd.viewer.open(tiles);
  }

  private _openExternal3iFImage(image: ReadStillImageExternalFileValue) {
    const i3f = IIIFUrl.createUrl(image.externalUrl);
    if (!i3f) {
      throw new AppError('Error with IIIF URL');
    }

    this.osd.viewer.open(i3f.infoJsonUrl);
  }
}
