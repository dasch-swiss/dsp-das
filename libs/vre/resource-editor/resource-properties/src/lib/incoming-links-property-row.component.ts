import { Component, ViewChild } from '@angular/core';
import { IncomingResourcePagerComponent } from '@dasch-swiss/vre/ui/ui';
import { BehaviorSubject } from 'rxjs';
import { IncomingOrStandoffLink } from './incoming-link.interface';

@Component({
  selector: 'app-incoming-links-property-row',
  template: ` <app-property-row
    tooltip="Indicates that this resource is referred to by another resource"
    label="has incoming link"
    [borderBottom]="true"
    class="incoming-link"
    [class]="getRowClass(showAllProperties$ | async, (incomingLinks$ | async).length)">
    <app-incoming-standoff-link-value *ngIf="(incomingLinks$ | async)?.length > 0" [links]="incomingLinks$ | async" />
    <app-incoming-resource-pager #pager [lastItemOfPage]="incomingLinks.length" (pageChanged)="pageChanged()" />
  </app-property-row>`,
})
export class IncomingLinksPropertyRowComponent {
  @ViewChild('pager', { static: false })
  pagerComponent: IncomingResourcePagerComponent | undefined;

  private incomingLinksSubject = new BehaviorSubject<IncomingOrStandoffLink[]>([]);
  incomingLinks$ = this.incomingLinksSubject.asObservable();
  incomingLinks: IncomingOrStandoffLink[] = [];

  pageChanged() {
    this.incomingLinksSubject.next(
      this.incomingLinks.slice(this.pagerComponent?.itemRangeStart, this.pagerComponent?.itemRangeEnd)
    );
  }
}
