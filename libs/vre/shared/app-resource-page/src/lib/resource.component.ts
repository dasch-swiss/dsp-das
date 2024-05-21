import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { RegionService, ValueOperationEventService } from '@dasch-swiss/vre/shared/app-representations';
import { Subject, Subscription } from 'rxjs';
import { CompoundService } from './compound/compound.service';
import { IncomingRepresentationsService } from './incoming-representations.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
  providers: [ValueOperationEventService, IncomingRepresentationsService, CompoundService, RegionService], // provide service on the component level so that each implementation of this component has its own instance.
})
export class ResourceComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) resource!: DspResource;

  incomingResource: DspResource;
  annotationResources: DspResource[];
  selectedRegion: string;
  selectedTab = 0;
  selectedTabLabel: string;
  loading = false;
  valueOperationEventSubscriptions: Subscription[] = [];
  showRestrictedMessage = true;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _router: Router,
    private _titleService: Title,
    public incomingRepresentationsService: IncomingRepresentationsService
  ) {
    this._router.events.subscribe(() => {
      this._titleService.setTitle('Resource view');
    });
  }

  ngOnChanges() {
    this.incomingResource = undefined;
    this.showRestrictedMessage = true;
    this._newMethod();
  }

  private _newMethod() {
    const resource = this.resource;
    if (resource.isRegion) {
      this._renderAsRegion(resource);
    }

    this.incomingRepresentationsService.onInit(resource);
  }

  ngOnDestroy() {
    this.valueOperationEventSubscriptions?.forEach(sub => sub.unsubscribe());

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  openRegion(iri: string) {
    // open annotation tab
    this.selectedTab = this.incomingResource ? 2 : 1;

    // activate the selected region
    this.selectedRegion = iri;

    // and scroll to region with this id
    const region = document.getElementById(iri);
    if (region) {
      region.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  private _renderAsRegion(region: DspResource) {
    this.selectedTabLabel = 'annotations';
    this.openRegion(region.res.id);
    this.selectedRegion = region.res.id;
  }
}
