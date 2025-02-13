import { ChangeDetectorRef, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { ReadResource, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IncomingService } from '@dasch-swiss/vre/shared/app-common-to-move';
import { IncomingResourcePagerComponent } from '@dasch-swiss/vre/ui/ui';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { expand, map, reduce, take, takeWhile } from 'rxjs/operators';
import { IncomingOrStandoffLink } from './incoming-link.interface';
import { sortByKeys } from './sortByKeys';

@Component({
  selector: 'app-incoming-links-property-row',
  template: ` <app-property-row
    tooltip="Indicates that this resource is referred to by another resource"
    label="has incoming link"
    [borderBottom]="true"
    class="incoming-link"
    [isEmptyRow]="(incomingLinks$ | async).length === 0">
    <app-incoming-standoff-link-value *ngIf="(incomingLinks$ | async)?.length > 0" [links]="incomingLinks$ | async" />
    <app-incoming-resource-pager #pager [lastItemOfPage]="incomingLinks.length" (pageChanged)="pageChanged()" />
  </app-property-row>`,
})
export class IncomingLinksPropertyRowComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;
  @ViewChild('pager', { static: false })
  pagerComponent: IncomingResourcePagerComponent | undefined;

  private _incomingLinksSubject = new BehaviorSubject<IncomingOrStandoffLink[]>([]);
  incomingLinks$ = this._incomingLinksSubject.asObservable();
  incomingLinks: IncomingOrStandoffLink[] = [];

  constructor(
    private _cd: ChangeDetectorRef,
    private _incomingService: IncomingService
  ) {}

  ngOnChanges() {
    this._incomingLinksSubject.next([]);
    this._doIncomingLinkSearch(0);
  }

  pageChanged() {
    this._incomingLinksSubject.next(
      this.incomingLinks.slice(this.pagerComponent?.itemRangeStart, this.pagerComponent?.itemRangeEnd)
    );
  }

  private _doIncomingLinkSearch(offset = 0) {
    this._getIncomingLinksRecursively$(this.resource.res.id, offset)
      .pipe(take(1))
      .subscribe(incomingLinks => {
        this.incomingLinks = incomingLinks;
        this._incomingLinksSubject.next(incomingLinks.slice(0, this.pagerComponent!.pageSize - 1));
        this._cd.detectChanges();
      });
  }

  private _getIncomingLinksRecursively$(resourceId: string, offset = 0): Observable<IncomingOrStandoffLink[]> {
    return this._incomingService.getIncomingLinksForResource(resourceId, offset).pipe(
      expand(sequence => {
        if (!(sequence as ReadResourceSequence).mayHaveMoreResults) {
          return of(sequence as ReadResourceSequence);
        }

        return this._incomingService.getIncomingLinksForResource(
          resourceId,
          offset + 1
        ) as Observable<ReadResourceSequence>;
      }),
      takeWhile(response => response.resources.length > 0 && response.mayHaveMoreResults, true),
      reduce((all: ReadResource[], data) => all.concat(data.resources), []),
      map(incomingResources => {
        const incomingLinks = incomingResources.map(resource =>
          IncomingLinksPropertyRowComponent.createIncomingOrStandoffLink(resource)
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
