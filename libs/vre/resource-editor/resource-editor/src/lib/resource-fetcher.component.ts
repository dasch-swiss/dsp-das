import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { mapTo, tap } from 'rxjs/operators';

@Component({
  selector: 'app-resource-fetcher',
  template: `
    <app-resource *ngIf="resource$ | async as resource; else loadingTpl" [resource]="resource" />

    <ng-template #loadingTpl>
      <app-progress-indicator />
    </ng-template>

    <ng-container *ngIf="resourceDeleted$ | async">
      <h3 style="text-align: center; margin-top: 50px">This resource does not exist.</h3>
    </ng-container>
  `,
  providers: [ResourceFetcherService],
})
export class ResourceFetcherComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) resourceIri!: string;
  @Output() afterResourceDeleted = new EventEmitter<ReadResource>();

  resource$ = this._resourceFetcherService.resource$.pipe(
    tap(
      v => {},
      e => {
        this.errorLoading = true;
      }
    )
  );

  resourceDeleted$ = this._resourceFetcherService.resourceIsDeleted$.pipe(
    tap(res => {
      this.afterResourceDeleted.emit(res.res);
    }),
    mapTo(true)
  );

  errorLoading = false;

  constructor(private _resourceFetcherService: ResourceFetcherService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resourceIri']) {
      this._resourceFetcherService.onDestroy();
      this._resourceFetcherService.onInit(this.resourceIri);
    }
  }

  ngOnDestroy() {
    this._resourceFetcherService.onDestroy();
  }
}
