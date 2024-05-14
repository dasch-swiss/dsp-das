import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Cardinality, ReadUser } from '@dasch-swiss/dsp-js';
import { DspResource, PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { PropertiesDisplayService } from '@dasch-swiss/vre/shared/app-resource-properties';
import { ResourceSelectors } from '@dasch-swiss/vre/shared/app-state';
import {
  IncomingLink,
  PropertiesDisplayIncomingLinkService,
} from '@dsp-app/src/app/workspace/resource/properties/properties-display-incoming-link.service';
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
        <div *ngFor="let prop of myProperties; let last = last; trackBy: trackByPropertyInfoFn">
          <div [class.border-bottom]="prop.values && !last" style="display: flex; padding: 8px 0;">
            <h3 class="label mat-subtitle-2" [matTooltip]="prop.propDef.comment" matTooltipPosition="above">
              {{ prop.propDef.label
              }}{{
                prop.guiDef.cardinality === cardinality._1 || prop.guiDef.cardinality === cardinality._1_n ? '*' : ''
              }}
            </h3>
            <app-existing-property-value [prop]="prop" [resource]="resource.res"></app-existing-property-value>
          </div>
        </div>
      </ng-container>
    </ng-container>
    <h1>Incoming</h1>
    <div
      *ngFor="let res of incomingLinks$ | async; let last = last"
      [class.border-bottom]="!last"
      style="display: flex; padding: 8px 0;">
      <h3 class="label mat-subtitle-2" matTooltip="Incoming link" matTooltipPosition="above">Incoming Link</h3>
      <div>{{ res.label }}</div>
      <div>{{ res.uri }}</div>
      <div>{{ res.project }}</div>
    </div>
    <h1>End Incoming</h1>

    <ng-template #noProperties>
      <div *ngIf="resource.res.isDeleted; else noDefinedProperties">
        <div>
          <h3 class="label mat-subtitle-2">Deleted on</h3>
          <div>{{ resource.res.deleteDate | date }}</div>
        </div>
        <div>
          <h3 class="label mat-subtitle-2">Comment</h3>
          <div>{{ resource.res.deleteComment }}</div>
        </div>
      </div>
    </ng-template>

    <ng-template #noDefinedProperties>
      <h3 class="label mat-subtitle-2">Info</h3>
      <div class="property-value">This resource has no defined properties.</div>
    </ng-template>
  `,
  styles: [
    `
      .label {
        color: rgb(107, 114, 128);
        align-self: start;
        cursor: help;
        width: 150px;
        margin-top: 0px;
        text-align: right;
        padding-right: 24px;
        flex-shrink: 0;
      }

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
  incomingLinks$: Observable<IncomingLink[]>;

  constructor(
    private _propertiesDisplayService: PropertiesDisplayService,
    private _propertiesDisplayIncomingLink: PropertiesDisplayIncomingLinkService,
    private _store: Store
  ) {}

  ngOnChanges() {
    this._setupProperties();
    this.incomingLinks$ = this._propertiesDisplayIncomingLink.getIncomingLinks$(this.resource.res.id, 0);
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
