import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { KnoraApiConnection, ReadResource, ReadResourceSequence, ReadUser } from '@dasch-swiss/dsp-js';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { DspResource } from '@dsp-app/src/app/workspace/resource/dsp-resource';
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

  region: DspResource;

  selectedTab = 0;

  constructor(
    private _dspApiConnection: KnoraApiConnection,
    private _incomingService: IncomingService
  ) {}

  ngOnInit() {
    if (this.resource.hasRegion) {
      // set region and get the stillimage resource onto which the region is the region of
      this.region = this.resource;
      this._dspApiConnection.v2.res.getResource(this.resource.isRegionOf.id).subscribe((res: ReadResource) => {
        this.setResource(new DspResource(res));
        this.selectRegion(this.region);
      });
    }
  }

  setResource(resource: DspResource) {
    this.resource = resource;
    this._incomingService.getIncomingRegions(resource.id, 0).subscribe((regions: ReadResourceSequence) => {
      this.resource.incomingAnnotations = regions.resources.map((res: ReadResource) => new DspResource(res));
    });
  }

  selectRegion(region: DspResource) {
    // load region
    this.selectedTab = 1; // change to region tab?
    // emit region to service/other components
  }

  // get reprepseantations of the resource

  // project : not needed. Only for attaching a new region to.

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
