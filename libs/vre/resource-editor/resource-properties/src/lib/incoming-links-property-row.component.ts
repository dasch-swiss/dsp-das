import { ChangeDetectorRef, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IncomingResourcePagerComponent } from '@dasch-swiss/vre/ui/ui';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { IncomingOrStandoffLink } from './incoming-link.interface';
import { PropertiesDisplayIncomingLinkService } from './properties-display-incoming-link.service';

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
    private _propertiesDisplayIncomingLink: PropertiesDisplayIncomingLinkService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnChanges() {
    this._incomingLinksSubject.next([]);
    this._doIncomingLinkSearch(0);
  }

  private _doIncomingLinkSearch(offset = 0) {
    this._propertiesDisplayIncomingLink
      .getIncomingLinksRecursively$(this.resource.res.id, offset)
      .pipe(take(1))
      .subscribe(incomingLinks => {
        this.incomingLinks = incomingLinks;
        this._incomingLinksSubject.next(incomingLinks.slice(0, this.pagerComponent!.pageSize - 1));
        this._cd.detectChanges();
      });
  }

  pageChanged() {
    this._incomingLinksSubject.next(
      this.incomingLinks.slice(this.pagerComponent?.itemRangeStart, this.pagerComponent?.itemRangeEnd)
    );
  }
}
