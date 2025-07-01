import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { FormValueArray, propertiesTypeMapping } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-create-resource-form-properties',
  template: `
    <app-create-resource-form-row
      *ngFor="let prop of myProperties; let last = last"
      [style.border-bottom]="last ? '0' : '1px solid rgba(33,33,33,.1)'"
      [label]="
        prop.propDef.label +
        (prop.guiDef.cardinality === cardinality._1 || prop.guiDef.cardinality === cardinality._1_n ? '*' : '')
      "
      [tooltip]="prop.propDef.comment">
      <app-property-values-creator [myProperty]="prop" [formArray]="formGroup.controls[prop.propDef.id]" />
    </app-create-resource-form-row>
  `,
})
export class CreateResourceFormPropertiesComponent {
  @Input({ required: true }) resourceClassIri!: string;
  @Input({ required: true }) formGroup!: FormGroup<{ [key: string]: FormValueArray }>;
  @Input({ required: true }) properties!: PropertyInfoValues[];

  get myProperties() {
    return this.properties?.filter(prop => propertiesTypeMapping.has(prop.propDef.objectType!)) ?? [];
  }

  protected readonly cardinality = Cardinality;
}
