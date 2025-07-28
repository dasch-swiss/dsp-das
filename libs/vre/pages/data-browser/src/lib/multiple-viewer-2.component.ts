import { Component } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { FilteredResources } from '@dasch-swiss/vre/shared/app-common-to-move';
import { MultipleViewerService } from './multiple-viewer.service';
import { SplitSize } from './split-size.interface';

@Component({
  selector: 'app-multiple-viewer-2',
  template: ` <div [ngSwitch]="viewMode">
    <!-- single resource view -->
    <ng-container *ngIf="multipleViewerService.selectedResourceIds$ | async as selectedResources">
      <app-comparison *ngIf="selectedResources.length > 1; else singleResourceTpl" [resourceIds]="selectedResources" />
    </ng-container>

    <ng-template #singleResourceTpl>
      <app-resource-fetcher
        *ngIf="multipleViewerService.activatedResourceId as resourceIri"
        [resourceIri]="resourceIri"
        (afterResourceDeleted)="updateResourceCount($event)" />
    </ng-template>
    ">

    <!-- intermediate view -->
    <!--<app-intermediate *ngSwitchCase="'intermediate'" [resources]="selectedResources" />-->

    <!-- multiple resources view / comparison viewer -->
  </div>`,
})
export class MultipleViewer2Component {
  splitSizeChanged: SplitSize | undefined = undefined;
  selectedResources: FilteredResources | undefined = undefined;
  viewMode: 'single' | 'intermediate' | 'compare' = 'single';

  constructor(public multipleViewerService: MultipleViewerService) {}

  updateResourceCount(resource: ReadResource) {
    // TODO
  }
}
