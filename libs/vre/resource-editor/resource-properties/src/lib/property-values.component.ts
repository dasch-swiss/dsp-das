import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Cardinality, ReadResource, ReadValue } from '@dasch-swiss/dsp-js';
import { ResourceUtil } from '@dasch-swiss/vre/resource-editor/representations';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { JsLibPotentialError } from './JsLibPotentialError';
import { PropertyValueService } from './property-value.service';

@Component({
  selector: 'app-property-values',
  template: `
    @for (group of propertyValueService.editModeData.values; track group; let index = $index) {
      <app-property-value [index]="index" style="width: 100%" />
    }

    @if (userCanAdd && !currentlyAdding && (editModeData.values.length === 0 || matchesCardinality)) {
      <button mat-icon-button (click)="currentlyAdding = true" data-cy="add-property-value-button">
        <mat-icon class="add-icon">add_box</mat-icon>
      </button>
    }

    @if (currentlyAdding) {
      <app-property-value-add (stopAdding)="currentlyAdding = false" />
    }
  `,
  providers: [PropertyValueService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PropertyValuesComponent implements OnChanges {
  @Input({ required: true }) editModeData!: { resource: ReadResource; values: ReadValue[] };
  @Input({ required: true }) myProperty!: PropertyInfoValues;

  get userCanAdd() {
    return ResourceUtil.userCanEdit(this.editModeData.resource);
  }

  get matchesCardinality() {
    return [Cardinality._0_n, Cardinality._1_n].includes(this.propertyValueService.cardinality);
  }

  get propertyDefinition() {
    return JsLibPotentialError.setAs(this.myProperty.propDef);
  }

  currentlyAdding = false;

  constructor(public readonly propertyValueService: PropertyValueService) {}

  ngOnChanges() {
    this._setupData();
  }

  private _setupData() {
    this.propertyValueService.editModeData = this.editModeData;
    this.propertyValueService.propertyDefinition = this.propertyDefinition;
    this.propertyValueService.cardinality = this.myProperty.guiDef.cardinality;
  }
}
