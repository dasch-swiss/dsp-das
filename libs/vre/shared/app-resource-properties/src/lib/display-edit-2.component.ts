import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dsp-app/src/app/workspace/resource/properties/property-info-values.interface';
import { propertiesTypeMapping } from '@dsp-app/src/app/workspace/resource/resource-instance-form/resource-payloads-mapping';
import { FormValueArray } from './form-value-array.type';

@Component({
  selector: 'app-display-edit-2',
  template: `
    <app-switch-properties-3
      [propertyDefinition]="prop.propDef"
      [property]="prop.guiDef"
      [cardinality]="prop.guiDef.cardinality"
      [formArray]="formArray"
      [editModeData]="{ resource, values: prop.values }"></app-switch-properties-3>
  `,
  styles: [':host { display: block; position: relative; width: 100%}'],
})
export class DisplayEdit2Component implements OnInit {
  @Input() prop!: PropertyInfoValues;
  @Input() resource!: ReadResource;

  formArray!: FormValueArray;

  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
    this.formArray = this._fb.array(
      this.prop.values.map(value => {
        const property = propertiesTypeMapping.get(this.prop.propDef.objectType);
        if (property === undefined) {
          throw new Error(`The property of type ${this.prop.propDef.objectType} is unknown`);
        }
        return this._fb.group({
          item: property.control(value) as AbstractControl,
          comment: this._fb.control(value.valueHasComment),
        });
      })
    );
  }
}
