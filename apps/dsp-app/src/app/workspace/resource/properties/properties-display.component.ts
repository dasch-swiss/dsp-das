import { Component, Input, OnChanges } from '@angular/core';
import { Cardinality, Constants } from '@dasch-swiss/dsp-js';
import { DspResource, PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { PropertiesDisplayService } from '@dasch-swiss/vre/shared/app-resource-properties';
import { isA } from '@jest/expect-utils';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RepresentationConstants } from '../representation/file-representation';

@Component({
  selector: 'app-properties-display',
  template: `
    <div style="display: flex; justify-content: end; background: #EAEFF3; margin-bottom: 8px">
      <app-properties-toolbar [showToggleProperties]="true"></app-properties-toolbar>
      <app-resource-toolbar *ngIf="isAnnotation" [resource]="resource"></app-resource-toolbar>
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
            <div style="flex: 1">
              <app-existing-property-value [prop]="prop" [resource]="resource.res"></app-existing-property-value>
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
  providers: [PropertiesDisplayService],
})
export class PropertiesDisplayComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;
  @Input({ required: true }) properties!: PropertyInfoValues[];
  @Input() isAnnotation = false;

  myProperties$!: Observable<PropertyInfoValues[]>;

  constructor(private _propertiesDisplayService: PropertiesDisplayService) {}

  ngOnChanges() {
    this._setupProperties();
  }

  private _setupProperties() {
    this.myProperties$ = this._propertiesDisplayService.showAllProperties$.pipe(
      map(showAllProps => PropertiesDisplayComponent.getMyProperties(showAllProps, this.properties))
    );
  }

  static getMyProperties(showAllProperties: boolean, properties: PropertyInfoValues[]) {
    const representationConstants = RepresentationConstants;

    const condition = (prop: PropertyInfoValues) =>
      prop.propDef.id === Constants.HasIncomingLinkValue &&
      //   numberOffAllIncomingLinkRes > 0 &&
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

    return properties.filter(prop => {
      return showAllProperties || (prop.values && prop.values.length > 0);
    });
  }

  trackByPropertyInfoFn = (index: number, item: PropertyInfoValues) => `${index}-${item.propDef.id}`;
  protected readonly cardinality = Cardinality;
  protected readonly isA = isA;
}
