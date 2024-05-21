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

  annotationResources: DspResource[];
  selectedTab = 0;
  loading = false;
  valueOperationEventSubscriptions: Subscription[] = [];
  showRestrictedMessage = true;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _router: Router,
    private _titleService: Title,
    public incomingRepresentationsService: IncomingRepresentationsService,
    private _regionService: RegionService
  ) {
    this._router.events.subscribe(() => {
      this._titleService.setTitle('Resource view');
    });
  }

  ngOnChanges() {
    this.showRestrictedMessage = true;

    this._newMethod();
  }

  private _newMethod() {
    this.incomingRepresentationsService.onInit(this.resource);
  }

  ngOnDestroy() {
    this.valueOperationEventSubscriptions?.forEach(sub => sub.unsubscribe());

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
