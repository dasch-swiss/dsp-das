import { Component, Input, OnChanges } from '@angular/core';
import { Constants } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-resource-properties';
import { ResourceSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DspResource } from '../dsp-resource';
import { RepresentationConstants } from '../representation/file-representation';

@Component({
  selector: 'app-properties-display',
  template: `
    <app-properties-toolbar
      [showToggleProperties]="true"
      style="
    display: block;
    margin-bottom: 8px"></app-properties-toolbar>

    <!-- list of properties -->
    <ng-container *ngIf="myProperties$ | async as myProperties">
      <ng-container *ngIf="myProperties.length > 0; else noProperties">
        <div *ngFor="let prop of myProperties; let last = last; trackBy: trackByPropertyInfoFn">
          <div [class.border-bottom]="prop.values && !last" style="display: flex; padding: 8px 0;">
            <h3 class="label mat-subtitle-2" [matTooltip]="prop.propDef.comment" matTooltipPosition="above">
              {{ prop.propDef.label }}
            </h3>
            <div style="flex: 1">
              <app-existing-property-value [prop]="prop" [resource]="resource.res"></app-existing-property-value>
              <!-- in case of incoming links we have to display them here -->
              <!--<div *ngIf="prop.propDef.id === hasIncomingLinkIri">-->
            </div>
          </div>
        </div>
      </ng-container>
    </ng-container>

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
    '.label {color: rgb(107, 114, 128); align-self: start; cursor: help; width: 150px; margin-top: 0px; text-align: right; padding-right: 24px; flex-shrink: 0}',
  ],
})
export class PropertiesDisplayComponent implements OnChanges {
  @Input() resource: DspResource;

  myProperties$!: Observable<PropertyInfoValues[]>;
  showAllProperties$ = this._store.select(ResourceSelectors.showAllProps);

  constructor(private _store: Store) {}

  ngOnChanges() {
    this._setupProperties();
  }

  private _setupProperties() {
    this.myProperties$ = this.showAllProperties$.pipe(
      map(showAllProps => PropertiesDisplayComponent.getMyProperties(showAllProps, this.resource))
    );
  }

  static getMyProperties(showAllProperties: boolean, resource: DspResource) {
    const representationConstants = RepresentationConstants;

    const condition = (prop: PropertyInfoValues) =>
      prop.propDef.id === Constants.HasIncomingLinkValue &&
      //   numberOffAllIncomingLinkRes > 0 &&
      !prop.propDef['isLinkProperty'] &&
      ![
        RepresentationConstants.stillImage,
        RepresentationConstants.movingImage,
        RepresentationConstants.audio,
        RepresentationConstants.document,
        RepresentationConstants.text,
        RepresentationConstants.archive,
      ].includes(prop.propDef.objectType) &&
      !(
        //         isAnnotation &&
        (
          prop.propDef.subjectType === representationConstants.region &&
          prop.propDef.objectType !== representationConstants.color
        )
      );

    return resource.resProps
      .filter(prop => prop.guiDef.guiOrder !== undefined)
      .filter(prop => {
        return (
          showAllProperties ||
          (prop.values && prop.values.length > 0) ||
          // prop.propDef.objectType !== representationConstants.stillImage) || // TODO still image (julien change)
          condition(prop)
        );
      });
  }

  trackByPropertyInfoFn = (index: number, item: PropertyInfoValues) => `${index}-${item.propDef.id}`;
}
