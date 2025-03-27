import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-resource-fetcher',
  template: `
    <app-resource *ngIf="resource$ | async as resource; else loadingTpl" [resource]="resource" />

    <ng-template #loadingTpl>
      <app-progress-indicator />
    </ng-template>
  `,
  providers: [ResourceFetcherService],
})
export class ResourceFetcherComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) resourceIri!: string;
  @Output() afterResourceDeleted = new EventEmitter<ReadResource>();

  resource$ = this._resourceFetcherService.resource$.pipe(
    tap(res => {
      if (res.res.isDeleted) {
        this.afterResourceDeleted.emit(res.res);
      }
    })
  );

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
