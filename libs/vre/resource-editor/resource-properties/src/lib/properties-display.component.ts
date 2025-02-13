import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Cardinality, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { ResourceSelectors } from '@dasch-swiss/vre/core/state';
import { DspResource, PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';
import { PropertiesDisplayService } from './properties-display.service';

@Component({
  selector: 'app-properties-display',
  template: `
    <div style="display: flex; align-items: center; background: #EAEFF3; margin-bottom: 8px">
      <h3 style="margin: 0 16px" *ngIf="displayLabel" data-cy="property-header">{{ resource.res.label }}</h3>
      <div style="display: flex; justify-content: end; flex: 1">
        <app-properties-toolbar [showToggleProperties]="true" [showOnlyIcons]="displayLabel" style="flex-shrink: 0" />
        <app-resource-toolbar
          *ngIf="displayLabel"
          [adminPermissions]="false"
          [resource]="resource"
          [linkToNewTab]="linkToNewTab"
          (afterResourceDeleted)="afterResourceDeleted.emit()" />
      </div>
    </div>

    <div
      class="infobar mat-caption"
      *ngIf="displayLabel && ((resourceAttachedUser$ | async) !== undefined || resource.res.creationDate)">
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
    <ng-container *ngIf="editableProperties && editableProperties.length > 0; else noProperties">
      <app-property-row
        [isEmptyRow]="prop.values.length === 0"
        *ngFor="let prop of editableProperties; let last = last; trackBy: trackByPropertyInfoFn"
        [borderBottom]="true"
        [tooltip]="prop.propDef.comment"
        [prop]="prop"
        [label]="
          prop.propDef.label +
          (prop.guiDef.cardinality === cardinality._1 || prop.guiDef.cardinality === cardinality._1_n ? '*' : '')
        ">
        <app-existing-property-value [prop]="prop" [resource]="resource.res" />
      </app-property-row>
    </ng-container>

    <app-standoff-links-property-row [resource]="resource" />
    <app-incoming-links-property-row [resource]="resource" />

    <ng-template #noProperties>
      <app-property-row label="info" [borderBottom]="false" [isEmptyRow]="false">
        This resource has no defined properties.
      </app-property-row>
      <div *ngIf="resource.res.isDeleted">
        <app-property-row label="Deleted on" [borderBottom]="true" [isEmptyRow]="false">
          {{ resource.res.deleteDate | date }}
        </app-property-row>
        <app-property-row label="Comment" [borderBottom]="false" [isEmptyRow]="false">
          {{ resource.res.deleteComment }}
        </app-property-row>
      </div>
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
  providers: [PropertiesDisplayService],
})
export class PropertiesDisplayComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;
  @Input() displayLabel = false;
  @Input() linkToNewTab?: string;
  @Output() afterResourceDeleted = new EventEmitter();

  protected readonly cardinality = Cardinality;

  resourceAttachedUser$ = this._store
    .select(ResourceSelectors.attachedUsers)
    .pipe(
      map(attachedUsers =>
        attachedUsers[this.resource.res.id]?.value.find(u => u.id === this.resource.res.attachedToUser)
      )
    );

  editableProperties: PropertyInfoValues[] = [];

  constructor(private _store: Store) {}

  ngOnChanges() {
    this.editableProperties = this.resource.resProps.filter(
      prop => (prop.propDef as ResourcePropertyDefinition).isEditable
    );
  }

  trackByPropertyInfoFn = (index: number, item: PropertyInfoValues) => `${index}-${item.propDef.id}`;
}
