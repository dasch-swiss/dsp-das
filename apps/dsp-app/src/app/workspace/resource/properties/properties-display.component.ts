import { Component, Input } from '@angular/core';
import { Constants } from '@dasch-swiss/dsp-js';
import { DspResource } from '@dsp-app/src/app/workspace/resource/dsp-resource';
import { PropertyInfoValues } from '@dsp-app/src/app/workspace/resource/properties/properties.component';
import { RepresentationConstants } from '@dsp-app/src/app/workspace/resource/representation/file-representation';

@Component({
  selector: 'app-properties-display',
  template: `
    <!-- toolbar -->

    <!-- additional line with project and user information -->

    <!-- list of properties -->
    <div class="properties-container">
      <div class="properties" *ngIf="resource.resProps.length > 0; else noProperties">
        <!-- list of properties -->
        <div *ngFor="let prop of myProperties; let last = last; trackBy: trackByPropertyInfoFn">
          <!-- show property; all in case of showAll === true or only the ones with prop.values -->
          <div [class.border-bottom]="prop.values && !last" class="property">
            <div class="property-label">
              <!-- label of the property -->
              <h3
                class="label mat-subtitle-2"
                [class.label-info]="prop.propDef.comment"
                [matTooltip]="prop.propDef.comment"
                matTooltipPosition="above">
                {{ prop.propDef.label }}
              </h3>
            </div>
            <div class="property-value">
              <!-- the value(s) of the property -->
              <app-display-edit-2 [prop]="prop" [resource]="resource.res"></app-display-edit-2>
              <!-- Add value form -->
              <!--<div *ngIf="addValueFormIsVisible && propID === prop.propDef.id && project?.status">
                                                                                                                                              <app-add-value
                                                                                                                                                #addValue
                                                                                                                                                class="add-value"
                                                                                                                                                [parentResource]="resource.res"
                                                                                                                                                [resourcePropertyDefinition]="$any(resource.res.entityInfo.properties[prop.propDef.id])"
                                                                                                                                                (operationCancelled)="hideAddValueForm()">
                                                                                                                                              </app-add-value>
                                                                                                                                            </div>-->

              <!-- in case of incoming links we have to display them here -->
              <!--<div *ngIf="prop.propDef.id === hasIncomingLinkIri">
                                                                                                                                              <div>
                                                                                                                                                <a
                                                                                                                                                  class="link link-value"
                                                                                                                                                  *ngFor="let inRes of displayedIncomingLinkResources; trackBy: trackByFn"
                                                                                                                                                  (click)="openResource(inRes.id)"
                                                                                                                                                  >{{ inRes.resourceClassLabel }}: <strong>{{ inRes.label }}</strong></a
                                                                                                                                                >
                                                                                                                                                <mat-paginator *ngIf="numberOffAllIncomingLinkRes > amount_resources" [length]=numberOffAllIncomingLinkRes
                                                                                                                                                                                                                                                                                                           [pageSize]="amount_resources" [hidePageSize]="true" [pageIndex]="pageEvent.pageIndex"
                                                                                                                                                                                                                                                                                                           (page)="goToPage($event)">
                                                                                                                                                                                                                                                                                            </mat-paginator>
                                                                                                                                                <div class="pagination" *ngIf="allIncomingLinkResources.length > amount_resources">
                                                                                                                                                  <p>Show more</p>
                                                                                                                                                  <button [disabled]="pageEvent.pageIndex < 1" (click)="handleIncomingLinkBackward()">
                                                                                                                                                    <mat-icon>chevron_left</mat-icon>
                                                                                                                                                  </button>
                                                                                                                                                  <button
                                                                                                                                                    [disabled]="allIncomingLinkResources.length / amount_resources <= pageEvent.pageIndex + 1"
                                                                                                                                                    (click)="handleIncomingLinkForward()">
                                                                                                                                                    <mat-icon>chevron_right</mat-icon>
                                                                                                                                                  </button>
                                                                                                                                                </div>
                                                                                                                                              </div>
                                                                                                                                            </div>-->
            </div>
          </div>
        </div>
      </div>

      <!-- deleted resource or resource without any defined properties -->
      <ng-template #noProperties>
        <div *ngIf="resource.res.isDeleted" class="properties">
          <div class="property border-bottom">
            <div class="property-label">
              <!-- delete date -->
              <h3 class="label mat-subtitle-2">Deleted on</h3>
            </div>
            <div class="property-value">{{ resource.res.deleteDate | date }}</div>
          </div>
          <div class="property">
            <div class="property-label">
              <!-- Delete comment -->
              <h3 class="label mat-subtitle-2">Comment</h3>
            </div>
            <div class="property-value">{{ resource.res.deleteComment }}</div>
          </div>
        </div>
        <!-- no defined property -->
        <div *ngIf="!resource.res.isDeleted" class="properties">
          <div class="property border-bottom">
            <div class="property-label">
              <h3 class="label mat-subtitle-2">Info</h3>
            </div>
            <div class="property-value">This resource has no defined properties.</div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class PropertiesDisplayComponent {
  @Input() resource: DspResource;

  get myProperties() {
    const representationConstants = RepresentationConstants;
    const hasIncomingLinkIri = Constants.HasIncomingLinkValue;

    return this.resource.resProps.filter(prop => {
      return (
        (prop.values && prop.values.length > 0) ||
        (prop.propDef.id === hasIncomingLinkIri &&
          //   numberOffAllIncomingLinkRes > 0 &&
          !prop.propDef['isLinkProperty'] &&
          prop.propDef.objectType !== representationConstants.stillImage &&
          prop.propDef.objectType !== representationConstants.movingImage &&
          prop.propDef.objectType !== representationConstants.audio &&
          prop.propDef.objectType !== representationConstants.document &&
          prop.propDef.objectType !== representationConstants.text &&
          prop.propDef.objectType !== representationConstants.archive &&
          !(
            //         isAnnotation &&
            (
              prop.propDef.subjectType === representationConstants.region &&
              prop.propDef.objectType !== representationConstants.color
            )
          ))
      );
    });
  }

  trackByPropertyInfoFn = (index: number, item: PropertyInfoValues) => `${index}-${item.propDef.id}`;
  trackByValuesFn = (index: number, item: any) => `${index}-${item}`;
}
