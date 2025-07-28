import { Component } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { FilteredResources } from '@dasch-swiss/vre/shared/app-common-to-move';
import { SplitSize } from './split-size.interface';

@Component({
  selector: 'app-multiple-viewer-2',
  template: ` <div [ngSwitch]="viewMode">
    <!-- single resource view -->
    <app-resource-fetcher
      *ngSwitchCase="'single'"
      [resourceIri]="selectedResources.resInfo[0].id"
      (afterResourceDeleted)="updateResourceCount($event)" />

    <!-- intermediate view -->
    <app-intermediate *ngSwitchCase="'intermediate'" [resources]="selectedResources" />

    <!-- multiple resources view / comparison viewer -->
    <app-comparison
      *ngSwitchCase="'compare'"
      [resources]="selectedResources?.resInfo"
      [splitSizeChanged]="splitSizeChanged" />
  </div>`,
})
export class MultipleViewer2Component {
  splitSizeChanged: SplitSize | undefined = undefined;
  selectedResources: FilteredResources | undefined = undefined;
  viewMode: 'single' | 'intermediate' | 'compare' = 'single';

  updateResourceCount(resource: ReadResource) {
    // TODO
  }
}
