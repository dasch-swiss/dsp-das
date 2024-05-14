import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Cardinality, ReadUser } from '@dasch-swiss/dsp-js';
import { DspResource, PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { PropertiesDisplayService } from '@dasch-swiss/vre/shared/app-resource-properties';
import { ResourceSelectors } from '@dasch-swiss/vre/shared/app-state';
import { PropertiesDisplayIncomingLinkService } from '@dsp-app/src/app/workspace/resource/properties/properties-display-incoming-link.service';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-properties-display',
  template: `
    <div style="display: flex; align-items: center; background: #EAEFF3; margin-bottom: 8px">
      <h3 style="margin: 0 16px" *ngIf="isAnnotation">{{ resource.res.label }}</h3>
      <div style="display: flex; justify-content: end; flex: 1">
        <app-properties-toolbar [showToggleProperties]="true" [showOnlyIcons]="isAnnotation"></app-properties-toolbar>
        <app-resource-toolbar *ngIf="isAnnotation" [resource]="resource"></app-resource-toolbar>
      </div>
    </div>

    <div
      class="infobar mat-caption"
      *ngIf="isAnnotation && ((resourceAttachedUser$ | async) !== undefined || resource.res.creationDate)">
      Created
      <span *ngIf="resourceAttachedUser$ | async as resourceAttachedUser">
        by
        {{
          resourceAttachedUser.username
            ? resourceAttachedUser.username
            : resourceAttachedUser.givenName + ' ' + resourceAttachedUser.familyName
        }}
      </span>
      <span *ngIf="resource.res.creationDate"> on {{ resource.res.creationDate | date }}</span>
    </div>

    <!-- list of properties -->
    <ng-container *ngIf="myProperties$ | async as myProperties">
      <ng-container *ngIf="myProperties.length > 0; else noProperties">
        <app-property-row
          *ngFor="let prop of myProperties; let last = last; trackBy: trackByPropertyInfoFn"
          [borderBottom]="prop.values && !last"
          [tooltip]="prop.propDef.comment"
          [label]="
            prop.propDef.label +
            (prop.guiDef.cardinality === cardinality._1 || prop.guiDef.cardinality === cardinality._1_n ? '*' : '')
          ">
          <app-existing-property-value [prop]="prop" [resource]="resource.res"></app-existing-property-value>
        </app-property-row>
      </ng-container>
    </ng-container>

    <!-- incoming link -->
    <app-property-row
      tooltip="Indicates that this resource is referred to by another resource"
      label="has incoming link"
      [borderBottom]="true">
      <app-incoming-link-value [resourceId]="resource.res.id"></app-incoming-link-value>
    </app-property-row>

    <ng-template #noProperties>
      <div *ngIf="resource.res.isDeleted; else noDefinedProperties">
        <app-property-row label="Deleted on" [borderBottom]="true">
          {{ resource.res.deleteDate | date }}
        </app-property-row>
        <app-property-row label="Comment" [borderBottom]="false">
          {{ resource.res.deleteComment }}
        </app-property-row>
      </div>
    </ng-template>

    <ng-template #noDefinedProperties>
      <app-property-row label="info" [borderBottom]="false">
        This resource has no defined properties.
      </app-property-row>
    </ng-template>
  `,
  styles: [
    `
      .infobar {
        text-align: right;
        padding-right: 6px;
      }
    `,
  ],
  providers: [PropertiesDisplayService, PropertiesDisplayIncomingLinkService],
})
export class PropertiesDisplayComponent implements OnChanges, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Input({ required: true }) resource!: DspResource;
  @Input({ required: true }) properties!: PropertyInfoValues[];
  @Input() isAnnotation = false;

  resourceAttachedUser$: Observable<ReadUser> = this._store.select(ResourceSelectors.attachedUsers).pipe(
    takeUntil(this.ngUnsubscribe),
    map(attachedUsers => attachedUsers[this.resource.res.id].value.find(u => u.id === this.resource.res.attachedToUser))
  );
  myProperties$!: Observable<PropertyInfoValues[]>;

  constructor(
    private _propertiesDisplayService: PropertiesDisplayService,
    private _store: Store
  ) {}

  ngOnChanges() {
    this._setupProperties();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private _setupProperties() {
    this.myProperties$ = this._propertiesDisplayService.showAllProperties$.pipe(
      map(showAllProps =>
        this.properties.filter(prop => {
          return showAllProps || (prop.values && prop.values.length > 0);
        })
      )
    );
  }

  trackByPropertyInfoFn = (index: number, item: PropertyInfoValues) => `${index}-${item.propDef.id}`;
  protected readonly cardinality = Cardinality;
}
