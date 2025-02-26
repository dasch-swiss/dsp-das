import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resource-fetcher',
  template: ' <app-resource *ngIf="resource" [resource]="resource" />',
  providers: [ResourceFetcherService],
})
export class ResourceFetcherComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) resourceIri!: string;
  @Output() resourceIsDeleted = new EventEmitter<void>();

  resource?: DspResource;
  private _ngUnsubscribe = new Subject<void>();

  constructor(private _resourceFetcherService: ResourceFetcherService) {}

  ngOnChanges() {
    this._resourceFetcherService.onDestroy();
    this._resourceFetcherService.onInit(this.resourceIri);

    this._unsubscribe();

    this._resourceFetcherService.resource$.pipe(takeUntil(this._ngUnsubscribe)).subscribe(resource => {
      if (resource === null) {
        return;
      }

      if (resource.res.isDeleted) {
        return;
      }

      this.resource = resource;
    });

    this._resourceFetcherService.resourceIsDeleted$.pipe(takeUntil(this._ngUnsubscribe)).subscribe(() => {
      this.resourceIsDeleted.emit();
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
