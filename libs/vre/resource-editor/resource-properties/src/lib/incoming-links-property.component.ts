import { Component, Input, OnChanges } from '@angular/core';
import { ApiResponseError, ReadResource, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IncomingService } from '@dasch-swiss/vre/shared/app-common-to-move';
import { forkJoin, Observable, of } from 'rxjs';
import { expand, filter, map, reduce, take, takeWhile, tap } from 'rxjs/operators';
import { IncomingOrStandoffLink } from './incoming-link.interface';
import { sortByKeys } from './sortByKeys';

@Component({
  selector: 'app-incoming-links-property',
  template: `
    <app-property-row
      [tooltip]="'resource.incomingLink.tooltip' | translate"
      [label]="'resource.incomingLink.label' | translate"
      [borderBottom]="true"
      [isEmptyRow]="!loading && allIncomingLinks.length === 0">
      <ng-container *ngIf="allIncomingLinks.length > 0">
        <app-incoming-standoff-link-value [links]="slidedLinks" />
        <app-incoming-resource-pager
          *ngIf="allIncomingLinks.length > pageSize"
          [pageIndex]="pageIndex"
          [pageSize]="pageSize"
          [lastPageIndex]="lastPageIndex"
          [itemsNumber]="slidedLinks.length"
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
  lastPageIndex?: number;

  constructor(private _incomingService: IncomingService) {}

  ngOnChanges() {
    this.allIncomingLinks = [];
    this.loading = true;
    this._loadInitialIncomingLinks();
  }

  pageChanged(pageIndex: number) {
    this.pageIndex = pageIndex;
    // load the next page if it is not already loaded
    if (pageIndex > this.pageIndex && (!this.lastPageIndex || pageIndex < this.lastPageIndex - 1)) {
      this._getIncomingLinks$(this.resource.res.id, pageIndex + 1)
        .pipe(take(1))
        .subscribe(nextLinks => {
          this.allIncomingLinks = [...this.allIncomingLinks, ...nextLinks];
        });
    }
  }

  private _loadInitialIncomingLinks(): void {
    this.loading = true;
    this._getIncomingLinks$(this.resource.res.id, 0)
      .pipe(
        take(1),
        tap(firstPageLinks => {
          if (firstPageLinks.length > 0) {
            this._getIncomingLinks$(this.resource.res.id, 1)
              .pipe(take(1))
              .subscribe(nextPageLinks => {
                this.allIncomingLinks = [...this.allIncomingLinks, ...nextPageLinks];
              });
          }
        })
      )
      .subscribe(firstPageLinks => {
        this.allIncomingLinks = firstPageLinks;
        this.loading = false;
      });
  }

  private _getIncomingLinks$(resourceId: string, offset: number): Observable<IncomingOrStandoffLink[]> {
    return this._incomingService.getIncomingLinksForResource(resourceId, offset).pipe(
      filter((sequence): sequence is ReadResourceSequence => !(sequence instanceof ApiResponseError)),
      tap(sequence => {
        if (sequence.resources.length < this.pageSize || !sequence.mayHaveMoreResults) {
          this.lastPageIndex = offset;
        }
      }),
      map(sequence =>
        sequence.resources.map(resource => IncomingLinksPropertyComponent.createIncomingOrStandoffLink(resource))
      )
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
      resourceClass: resource.resourceClassLabel ? resource.resourceClassLabel : '',
    };
  }
}
