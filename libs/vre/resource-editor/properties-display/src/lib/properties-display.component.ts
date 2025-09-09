import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { Cardinality, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import {
  PropertiesDisplayService,
  PropertyRowComponent,
  PropertyValuesWithFootnotesComponent,
} from '@dasch-swiss/vre/resource-editor/resource-properties';
import { DspResource, PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { AnnotationToolbarComponent } from './annotation-toolbar.component';
import { IncomingLinksPropertyComponent } from './incoming-links-property.component';
import { PropertiesToolbarComponent } from './properties-toolbar.component';
import { StandoffLinksPropertyComponent } from './standoff-links-property.component';

@Component({
  selector: 'app-properties-display',
  template: `
    <div style="display: flex; flex-direction: row-reverse; align-items: center; background: #EAEFF3">
      <div style="display: flex; flex: 0 0 auto">
        <app-properties-toolbar
          [showToggleProperties]="true"
          [showOnlyIcons]="displayLabel"
          [numberOfComments]="numberOfComments"
          style="flex-shrink: 0" />
        @if (displayLabel) {
          <app-annotation-toolbar [resource]="resource.res" [parentResourceId]="parentResourceId" />
        }
      </div>

      @if (displayLabel) {
        <h3
          style="margin: 0 16px; flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
          data-cy="property-header">
          {{ resource.res.label }}
        </h3>
      }
    </div>

    @if (displayLabel && ((resourceAttachedUser$ | async) !== undefined || resource.res.creationDate)) {
      <div class="infobar mat-caption">
        Created
        @if (resourceAttachedUser$ | async; as resourceAttachedUser) {
          <span>
            by
            {{
              resourceAttachedUser.username
                ? resourceAttachedUser.username
                : resourceAttachedUser.givenName + ' ' + resourceAttachedUser.familyName
            }}
          </span>
        }
        @if (resource.res.creationDate) {
          <span> on {{ resource.res.creationDate | date }}</span>
        }
      </div>
    }

    <!-- list of properties -->
    @if (editableProperties && editableProperties.length > 0) {
      @for (prop of editableProperties; track trackByPropertyInfoFn($index, prop); let last = $last) {
        <app-property-row
          [isEmptyRow]="prop.values.length === 0"
          [borderBottom]="true"
          [tooltip]="prop.propDef.comment"
          [prop]="prop"
          [singleRow]="false"
          [attr.data-cy]="'row-' + prop.propDef.label"
          [label]="
            prop.propDef.label +
            (prop.guiDef.cardinality === cardinality._1 || prop.guiDef.cardinality === cardinality._1_n ? '*' : '')
          ">
          <app-property-values-with-footnotes [prop]="prop" [resource]="resource.res" />
        </app-property-row>
      }
    } @else {
      <app-property-row label="info" [borderBottom]="false" [isEmptyRow]="false">
        <div>This resource has no defined properties.</div>
      </app-property-row>
    }

    <app-standoff-links-property [resource]="resource" />
    <app-incoming-links-property [resource]="resource.res" />
  `,
  styles: [
    `
      .infobar {
        text-align: right;
        padding-right: 6px;
      }
    `,
  ],
  providers: [PropertiesDisplayService],
  standalone: true,
  imports: [
    PropertiesToolbarComponent,
    AnnotationToolbarComponent,
    PropertyRowComponent,
    PropertyValuesWithFootnotesComponent,
    StandoffLinksPropertyComponent,
    IncomingLinksPropertyComponent,
    AsyncPipe,
    DatePipe,
  ],
})
export class PropertiesDisplayComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;
  @Input() displayLabel = false;
  @Input() linkToNewTab?: string;
  @Input() parentResourceId = '';

  protected readonly cardinality = Cardinality;

  editableProperties: PropertyInfoValues[] = [];

  numberOfComments!: number;
  resourceAttachedUser$ = this._resourceFetcherService.attachedUser$;

  constructor(private _resourceFetcherService: ResourceFetcherService) {}

  ngOnChanges() {
    this.editableProperties = this.resource.resProps.filter(
      prop => (prop.propDef as ResourcePropertyDefinition).isEditable
    );

    this.numberOfComments = this.resource.resProps.reduce((acc, prop) => {
      const valuesWithComments = prop.values.reduce(
        (_acc, value) => _acc + (value.valueHasComment === undefined ? 0 : 1),
        0
      );
      return acc + valuesWithComments;
    }, 0);
  }

  trackByPropertyInfoFn = (index: number, item: PropertyInfoValues) => `${index}-${item.propDef.id}`;
}
