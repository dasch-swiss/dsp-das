import { Component, Input } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { ResourceResultService } from '@dasch-swiss/vre/shared/app-helper-services';
import { PagerComponent } from '@dasch-swiss/vre/ui/ui';
import { ResourceListComponent } from './resource-list.component';

@Component({
  selector: 'app-resources-list',
  template: ` @if (resourceResultService.numberOfResults > resourceResultService.MAX_RESULTS_PER_PAGE) {
      <app-pager
        (pageIndexChanged)="updatePageIndex($event)"
        [numberOfAllResults]="resourceResultService.numberOfResults" />
    } @else {
      <div
        style="margin: 8px;
    border: 1px solid #ebebeb;
    padding: 8px;
    text-align: center;
    border-radius: 10px;">
        {{ resourceResultService.numberOfResults }} results
      </div>
    }

    <app-resource-list [resources]="resources" [showProjectShortname]="showProjectShortname" />`,
  styles: [
    `
      app-pager {
        margin: 8px;
      }
    `,
  ],
  imports: [MatAnchor, PagerComponent, ResourceListComponent],
})
export class ResourcesListComponent {
  @Input({ required: true }) resources!: ReadResource[];
  @Input() showProjectShortname = false;

  constructor(public resourceResultService: ResourceResultService) {}

  updatePageIndex(index: number) {
    this.resourceResultService.updatePageIndex(index);
  }
}
