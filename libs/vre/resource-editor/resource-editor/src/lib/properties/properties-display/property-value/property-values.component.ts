import { ChangeDetectionStrategy, Component, inject, Input, OnChanges } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Cardinality, ReadResource, ReadValue } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { TranslatePipe } from '@ngx-translate/core';
import { ResourceFetcherService } from '../../../representation/resource-fetcher.service';
import { ResourceUtil } from '../../../representation/resource.util';
import { JsLibPotentialError } from './JsLibPotentialError';
import { DraggableValueListComponent } from './draggable-value-list.component';
import { PropertyValueAddComponent } from './property-value-add.component';
import { PropertyValueComponent } from './property-value.component';
import { PropertyValueService } from './property-value.service';

@Component({
  selector: 'app-property-values',
  imports: [
    DraggableValueListComponent,
    MatButton,
    MatIcon,
    PropertyValueComponent,
    PropertyValueAddComponent,
    TranslatePipe,
  ],
  template: `
    <app-draggable-value-list
      [values]="editModeData.values"
      [resourceIri]="editModeData.resource.id"
      [propertyIri]="propertyDefinition.id"
      [disabled]="dragDropDisabled"
      [showHandle]="canReorder"
      (valuesChange)="editModeData.values = $event">
      <ng-template let-value let-index="index">
        <app-property-value [index]="index" style="width: 100%" />
      </ng-template>
    </app-draggable-value-list>

    @if (userCanAdd && !currentlyAdding && (editModeData.values.length === 0 || matchesCardinality)) {
      <!-- Says what it adds: a bare icon under a list of values read as decoration (DEV-7494). -->
      <button
        mat-button
        type="button"
        class="add-value"
        (click)="currentlyAdding = true"
        data-cy="add-property-value-button">
        <mat-icon>add</mat-icon>
        {{ 'resourceEditor.resourceProperties.actions.addValue' | translate: { property: propertyLabel } }}
      </button>
    }

    @if (currentlyAdding) {
      <app-property-value-add (stopAdding)="currentlyAdding = false" />
    }
  `,
  styles: [
    `
      /* A quiet text button under the values: as tall as a line, not a toolbar. */
      .add-value {
        --mat-button-text-container-height: 30px;
        --mat-button-text-horizontal-padding: 6px;

        margin-top: 2px;
        font-size: 13px;
      }
    `,
  ],
  providers: [PropertyValueService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyValuesComponent implements OnChanges {
  @Input({ required: true }) editModeData!: { resource: ReadResource; values: ReadValue[] };
  @Input({ required: true }) myProperty!: PropertyInfoValues;

  currentlyAdding = false;
  private readonly _resourceFetcherService = inject(ResourceFetcherService);
  readonly propertyValueService = inject(PropertyValueService);

  get userCanAdd() {
    return ResourceUtil.userCanEdit(this.editModeData.resource);
  }

  get canReorder(): boolean {
    return (
      ResourceUtil.userCanEdit(this.editModeData.resource) &&
      !this._resourceFetcherService.resourceVersion &&
      this.editModeData.values.length > 1
    );
  }

  get isAnyValueEditing(): boolean {
    return this.propertyValueService.lastOpenedItem$.value !== null;
  }

  get dragDropDisabled(): boolean {
    return !this.canReorder || this.isAnyValueEditing || this.currentlyAdding;
  }

  get matchesCardinality() {
    return [Cardinality._0_n, Cardinality._1_n].includes(this.propertyValueService.cardinality);
  }

  get propertyDefinition() {
    return JsLibPotentialError.setAs(this.myProperty.propDef);
  }

  /** The property's own name, for the add button: "Add Organiser" rather than a bare icon. */
  get propertyLabel(): string {
    return this.myProperty.propDef.label ?? '';
  }

  ngOnChanges() {
    this._setupData();
  }

  private _setupData() {
    this.propertyValueService.editModeData = this.editModeData;
    this.propertyValueService.propertyDefinition = this.propertyDefinition;
    this.propertyValueService.cardinality = this.myProperty.guiDef.cardinality;
  }
}
