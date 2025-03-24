import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resource-fetcher',
  template: `
    <app-resource-version-warning
      *ngIf="resourceVersion$ | async as resourceVersion"
      [resourceVersion]="resourceVersion" />

    <ng-container *ngIf="!loading">
      <app-resource *ngIf="resource; else noResourceTpl" [resource]="resource" />
    </ng-container>

    <ng-template #noResourceTpl
      ><h3 style="text-align: center; margin-top: 50px">This resource does not exist.</h3>
    </ng-template>
  `,
  providers: [ResourceFetcherService],
})
export class ResourceFetcherComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) resourceIri!: string;
  @Input() resourceVersion?: string;
  @Output() afterResourceDeleted = new EventEmitter<ReadResource>();

  resource?: DspResource;
  loading!: boolean;
  private _ngUnsubscribe = new Subject<void>();

  resourceVersion$ = this._route.queryParamMap.pipe(map(v => v.get('version')));

  constructor(
    private _resourceFetcherService: ResourceFetcherService,
    private _route: ActivatedRoute
  ) {}

  ngOnInit() {
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
      if (!this.resource) {
        throw new AppError('Resource is not defined');
      }
      this.afterResourceDeleted.emit(this.resource.res);

      this.resource = undefined;
    });
  }

  ngOnChanges() {
    this.loading = true;
    this._resourceFetcherService.onDestroy();
    this._resourceFetcherService.onInit(this.resourceIri, this.resourceVersion);
  }

  ngOnDestroy() {
    this._resourceFetcherService.onDestroy();

    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }
}
