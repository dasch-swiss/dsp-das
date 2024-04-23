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
import { PropertyInfoValues } from '@dsp-app/src/app/workspace/resource/properties/properties.component';
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
      // set region and get the stillimage resource onto which the region is the region of
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

  /**
   * gather resource property information
   */
  private initProps(resource: ReadResource): PropertyInfoValues[] {
    let props = resource.entityInfo.classes[resource.type]
      .getResourcePropertiesList()
      .map((prop: IHasPropertyWithPropertyDefinition) => {
        // the object type is none from above
        const propInfoAndValues = {
          propDef: prop.propertyDefinition,
          guiDef: prop,
          values: resource.getValues(prop.propertyIndex),
        };
        return propInfoAndValues;
      });

    // sort properties by guiOrder
    props = props
      .filter(prop => prop.propDef.objectType !== Constants.GeomValue)
      .sort((a, b) => (a.guiDef.guiOrder > b.guiDef.guiOrder ? 1 : -1))
      // to get equal results on all browser engines which implements sorting in different way
      // properties list has to be sorted again, pushing all "has..." properties to the bottom
      // TODO FOLLOWING LINE IS A BUG ARRAY-CALLBACK-RETURN SHOULDNT BE DISABLED
      // eslint-disable-next-line array-callback-return
      .sort(a => {
        if (a.guiDef.guiOrder === undefined) {
          return 1;
        }
      });

    return props;
  }

  selectRegion(region: DspResource) {
    // load region
    this.selectedTab = 1; // change to region tab?
    this._regionService.setActiveRegion(region.id);
  }

  // get reprepseantations of the resource

  // project : not needed. Only for attaching a new region to.

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
