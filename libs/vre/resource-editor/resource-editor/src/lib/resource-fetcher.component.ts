import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resource-fetcher',
  template: `
    <ng-container *ngIf="!loading">
      <app-resource *ngIf="resource; else noResourceTpl" [resource]="resource" />
    </ng-container>

    <ng-template #noResourceTpl
      ><h3 style="text-align: center; margin-top: 50px">This resource does not exist.</h3>
    </ng-template>
  `,
  providers: [ResourceFetcherService],
})
export class ResourceFetcherComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) resourceIri!: string;

  resource?: DspResource;
  loading!: boolean;
  private _ngUnsubscribe = new Subject<void>();

  constructor(private _resourceFetcherService: ResourceFetcherService) {}

  ngOnChanges() {
    this.loading = true;
    this._resourceFetcherService.onDestroy();
    this._resourceFetcherService.onInit(this.resourceIri);

    this._unsubscribe();

    this._resourceFetcherService.resource$.pipe(takeUntil(this._ngUnsubscribe)).subscribe(resource => {
      if (resource === null) {
        return;
      }

      this.loading = false;

      if (resource.res.isDeleted) {
        this.resource = undefined;
        return;
      }

      this.resource = resource;
    });

    this._resourceFetcherService.resourceIsDeleted$.pipe(takeUntil(this._ngUnsubscribe)).subscribe(() => {
      this.resource = undefined;
    });
  }

  ngOnDestroy() {
    this._resourceFetcherService.onDestroy();
    this._unsubscribe();
  }

  private _unsubscribe() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }
}
