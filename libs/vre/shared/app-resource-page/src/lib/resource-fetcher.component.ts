import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Constants, ReadLinkValue } from '@dasch-swiss/dsp-js';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { ResourceFetcherService } from '@dasch-swiss/vre/shared/app-representations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resource-fetcher',
  template:
    ' <app-resource *ngIf="resource" [resource]="resource" [resetCompoundPositionEvent]="resetCompoundPositionEvent"></app-resource>',
  providers: [ResourceFetcherService],
})
export class ResourceFetcherComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) resourceIri!: string;
  @Output() resetCompoundPositionEvent = new EventEmitter<void>();

  destroyed: Subject<void> = new Subject<void>();
  resource: DspResource | undefined;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _resourceFetcherService: ResourceFetcherService
  ) {}

  ngOnInit(): void {
    this._resourceFetcherService.resourceInitStarted.pipe(takeUntil(this.destroyed)).subscribe(() => {
      this.resetCompoundPositionEvent.emit();
    });
  }

  ngOnChanges() {
    this._resourceFetcherService.onDestroy();
    this._resourceFetcherService.onInit(this.resourceIri);
    this._resourceFetcherService.settings.imageFormatIsPng.next(false);

    this._resourceFetcherService.resource$.subscribe(resource => {
      if (resource === null) {
        return;
      }

      if (resource.res.isDeleted) {
        return;
      }

      if (resource.isRegion) {
        this._renderAsRegion(resource);
        return;
      }

      this.resource = resource;
      this._cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this._resourceFetcherService.onDestroy();
    this.destroyed.next();
    this.destroyed.complete();
  }

  private _renderAsRegion(region: DspResource) {
    const annotatedRepresentationIri = (region.res.properties[Constants.IsRegionOfValue] as ReadLinkValue[])[0]
      .linkedResourceIri;

    /* TODO
                        this._getResource(annotatedRepresentationIri).subscribe(dspResource => {
                          this.resource = dspResource;
                        });
                        */
  }
}
