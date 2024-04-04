import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { KnoraApiConnection, ReadResource, UpdateResource, UpdateValue, WriteValueResponse } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { FormValueArray } from '@dasch-swiss/vre/shared/app-resource-properties';
import { PropertyInfoValues } from '@dsp-app/src/app/workspace/resource/properties/properties.component';
import { propertiesTypeMapping } from '@dsp-app/src/app/workspace/resource/resource-instance-form/resource-payloads-mapping';
import { finalize, take } from 'rxjs/operators';

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
  @Input() prop: PropertyInfoValues;
  @Input() resource: ReadResource;

  formArray: FormValueArray;

  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
    this.formArray = this._fb.array(
      this.prop.values.map(value =>
        this._fb.group({
          item: propertiesTypeMapping.get(this.prop.propDef.objectType).control(value) as AbstractControl,
          comment: this._fb.control(value.valueHasComment),
        })
      )
    );
  }
}
