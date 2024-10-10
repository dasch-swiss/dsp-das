import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { ResourceFetcherService } from '@dasch-swiss/vre/shared/app-representations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-resource-fetcher',
  template: ' <app-resource *ngIf="resource" [resource]="resource"></app-resource>',
  providers: [ResourceFetcherService],
})
export class ResourceFetcherComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) resourceIri!: string;

  resource: DspResource | undefined;

  private _subscription?: Subscription;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _resourceFetcherService: ResourceFetcherService
  ) {}

  ngOnChanges() {
    this._resourceFetcherService.onDestroy();
    this._resourceFetcherService.onInit(this.resourceIri);
    this._resourceFetcherService.settings.imageFormatIsPng.next(false);

    if (this._subscription) {
      this._subscription.unsubscribe();
    }

    this._subscription = this._resourceFetcherService.resource$.subscribe(resource => {
      if (resource === null) {
        return;
      }

      if (resource.res.isDeleted) {
        return;
      }

      this.resource = undefined;
      this._cdr.detectChanges();
      this.resource = resource;
      this._cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this._resourceFetcherService.onDestroy();
  }
}
