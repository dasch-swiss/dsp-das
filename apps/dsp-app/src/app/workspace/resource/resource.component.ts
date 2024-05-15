import { Component, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DspCompoundPosition, DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IncomingRepresentationsService } from '@dsp-app/src/app/workspace/resource/incoming-representations.service';
import { Subject, Subscription } from 'rxjs';
import { StillImageComponent } from './representation/still-image/still-image.component';
import { ValueOperationEventService } from './services/value-operation-event.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
  providers: [ValueOperationEventService, IncomingRepresentationsService], // provide service on the component level so that each implementation of this component has its own instance.
})
export class ResourceComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) resource!: DspResource;
  @ViewChild('stillImage') stillImageComponent: StillImageComponent;
  @ViewChild('matTabAnnotations') matTabAnnotations;

  incomingResource: DspResource;
  annotationResources: DspResource[];
  selectedRegion: string;
  selectedTab = 0;
  selectedTabLabel: string;
  compoundPosition: DspCompoundPosition;
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
    this.compoundPosition = undefined;
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

  tabChanged(e: MatTabChangeEvent) {
    if (e.tab.textLabel === 'annotations') {
      this.stillImageComponent?.renderRegions();
    } else {
      this.stillImageComponent?.removeOverlays();
    }
    this.selectedTabLabel = e.tab.textLabel;
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
