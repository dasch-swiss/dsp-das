import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dsp-app/src/app/workspace/resource/properties/property-info-values.interface';
import { propertiesTypeMapping } from '@dsp-app/src/app/workspace/resource/resource-instance-form/resource-payloads-mapping';
import { ResourceClassIriService } from '../../../app-resource-form/src/lib/resource-class-iri.service';
import { FormValueArray } from './form-value-array.type';

@Component({
  selector: 'app-existing-property-value',
  template: `
    <app-property-value-switcher
      *ngIf="resourceClassIriService.resourceClassIri$ | async as resClassIri"
      [propertyDefinition]="prop.propDef"
      [property]="prop.guiDef"
      [cardinality]="prop.guiDef.cardinality"
      [formArray]="formArray"
      [resourceClassIri]="resClassIri"
      [editModeData]="{ resource, values: prop.values }"></app-property-value-switcher>
  `,
  providers: [ResourceClassIriService],
  styles: [':host { display: block; position: relative; width: 100%}'],
})
export class ExistingPropertyValueComponent implements OnInit {
  @Input() prop!: PropertyInfoValues;
  @Input() resource!: ReadResource;

  formArray!: FormValueArray;

  constructor(
    private _fb: FormBuilder,
    public resourceClassIriService: ResourceClassIriService
  ) {}

  ngOnInit() {
    this.formArray = this._fb.array(
      this.prop.values.map(value => {
        const property = propertiesTypeMapping.get(this.prop.propDef.objectType);
        if (property === undefined) {
          throw new Error(`The property of type ${this.prop.propDef.objectType} is unknown`);
        }
        return this._fb.group({
          item: property.control(value) as AbstractControl,
          comment: this._fb.control(value?.valueHasComment ?? null),
        });
      })
    );
  }
}
