import { Component, Input, OnChanges } from '@angular/core';
import { ReadResource, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { sortByKeys } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IncomingService } from '@dasch-swiss/vre/shared/app-common-to-move';
import { Observable, of } from 'rxjs';
import { expand, map, reduce, take, takeWhile } from 'rxjs/operators';
import { IncomingOrStandoffLink } from './incoming-link.interface';

@Component({
  selector: 'app-incoming-links-property',
  template: `
    <app-property-row
      [tooltip]="'resourceEditor.propertiesDisplay.incomingLinkTooltip' | translate"
      [label]="'resourceEditor.propertiesDisplay.incomingLinkLabel' | translate"
      [borderBottom]="true"
      [isEmptyRow]="!loading && allIncomingLinks.length === 0">
      <ng-container *ngIf="allIncomingLinks.length > 0">
        <app-incoming-standoff-link-value [links]="slidedLinks" />
        <app-incoming-resource-pager
          *ngIf="allIncomingLinks.length > pageSize"
          [pageIndex]="pageIndex"
          [pageSize]="pageSize"
          [itemsNumber]="allIncomingLinks.length"
          (pageChanged)="pageChanged($event)" />
      </ng-container>
      <app-progress-indicator *ngIf="loading" />
    </app-property-row>
  `,
})
export class IncomingLinksPropertyComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;

  get slidedLinks() {
    return this.allIncomingLinks.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize);
  }

  loading = true;
  pageSize = 25;
  allIncomingLinks: IncomingOrStandoffLink[] = [];
  pageIndex = 0;

  constructor(private _incomingService: IncomingService) {}

  ngOnChanges() {
    this.allIncomingLinks = [];
    this.loading = true;

    this._getIncomingLinksRecursively$(this.resource.res.id)
      .pipe(take(1))
      .subscribe(incomingLinks => {
        this.loading = false;
        this.allIncomingLinks = incomingLinks;
      });
  }

  pageChanged(page: number) {
    this.pageIndex = page;
  }

  private _getIncomingLinksRecursively$(resourceId: string) {
    let offset = 0;

    return this._incomingService.getIncomingLinksForResource(resourceId, offset).pipe(
      expand(sequence => {
        if (!sequence.mayHaveMoreResults) {
          return of(sequence);
        }

        offset += 1;

        return this._incomingService.getIncomingLinksForResource(
          resourceId,
          offset
        ) as Observable<ReadResourceSequence>;
      }),
      takeWhile(response => response.resources.length > 0 && response.mayHaveMoreResults, true),
      reduce((all: ReadResource[], data) => all.concat(data.resources), []),
      map(incomingResources => {
        const incomingLinks = incomingResources.map(resource =>
          IncomingLinksPropertyComponent.createIncomingOrStandoffLink(resource)
        );
        return sortByKeys(incomingLinks, ['project', 'label']);
      })
    );
  }

  static createIncomingOrStandoffLink(resource: ReadResource): IncomingOrStandoffLink {
    const resourceIdPathOnly = resource.id.match(/[^\/]*\/[^\/]*$/);
    if (!resourceIdPathOnly) {
      throw new AppError('Resource id is not in the expected format');
    }

    return {
      label: resource.label,
      uri: `/resource/${resourceIdPathOnly[0]}`,
      project: resource.resourceClassLabel ? resource.resourceClassLabel : '',
    };
  }
}
