import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import {
  Constants,
  IHasPropertyWithPropertyDefinition,
  KnoraApiConnection,
  ReadResource,
  ReadResourceSequence,
  ReadUser,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { DspResource } from '@dsp-app/src/app/workspace/resource/dsp-resource';
import { RegionService } from '@dsp-app/src/app/workspace/resource/representation/still-image_/region.service';
import { IncomingService } from '@dsp-app/src/app/workspace/resource/services/incoming.service';
import { Select } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-still-image_',
  templateUrl: './still-image_.component.html',
  styleUrls: ['./still-image_.component.scss'],
})
export class StillImageDsComponent implements OnInit, OnDestroy {
  @Input() resource: DspResource;

  get isAdmin$(): Observable<boolean> {
    return combineLatest([this.user$, this.userProjectAdminGroups$]).pipe(
      takeUntil(this.ngUnsubscribe),
      map(([user, userProjectGroups]) => {
        return this.resource.attachedToProject
          ? ProjectService.IsProjectAdminOrSysAdmin(user, userProjectGroups, this.resource.attachedToProject)
          : false;
      })
    );
  }

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Select(UserSelectors.user) user$: Observable<ReadUser>;
  @Select(UserSelectors.userProjectAdminGroups)
  private userProjectAdminGroups$: Observable<string[]>;

  activeRegion$: Observable<string | null> = this._regionService.activeRegion$;

  annotations: DspResource[] = [];
  annotations$: Observable<DspResource[]>;

  region: DspResource;

  selectedTab = 0;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _incomingService: IncomingService,
    private _regionService: RegionService
  ) {}

  ngOnInit() {
    if (this.resource.hasRegion) {
      // As the selected resource "is" a region set the region and get the still image resource onto which the region is the region is pointing to
      this.region = this.resource;
      this._dspApiConnection.v2.res.getResource(this.resource.isRegionOf.id).subscribe((res: ReadResource) => {
        this.setResource(new DspResource(res));
        this.selectRegion(this.region);
      });
    } else {
      this.setResource(this.resource);
    }
  }

  setResource(resource: DspResource) {
    this.resource = resource;
    this.annotations$ = this._incomingService.getIncomingRegions(resource.id, 0).pipe(
      map((regions: ReadResourceSequence) => {
        return regions.resources.map((res: ReadResource) => new DspResource(res));
      })
    );
    this._incomingService.getIncomingRegions(resource.id, 0).subscribe((regions: ReadResourceSequence) => {
      this.annotations = regions.resources.map((res: ReadResource) => new DspResource(res));
    });
  }

  selectRegion(region: DspResource) {
    // load region
    this.selectedTab = 1; // change to region tab?
    this._regionService.setActiveRegion(region.id);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
