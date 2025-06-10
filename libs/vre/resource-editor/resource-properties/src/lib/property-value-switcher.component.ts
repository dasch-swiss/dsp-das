import { Component, Input, OnInit } from '@angular/core';
import { ReadResource, ReadValue } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { JsLibPotentialError } from './JsLibPotentialError';
import { FormValueArray } from './form-value-array.type';
import { PropertyValueService } from './property-value.service';

@Component({
  selector: 'app-property-value-switcher',
  providers: [PropertyValueService],
  template: ` <app-property-values /> `,
})
export class PropertyValueSwitcherComponent implements OnInit {
  @Input({ required: true }) formArray!: FormValueArray;
  @Input({ required: true }) editModeData!: { resource: ReadResource; values: ReadValue[] };
  @Input({ required: true }) resourceClassIri!: string;

  @Input({ required: true }) myProperty!: PropertyInfoValues;

  get propertyDefinition() {
    return JsLibPotentialError.setAs(this.myProperty.propDef);
  }

  constructor(private _propertyValueService: PropertyValueService) {}

  ngOnInit() {
    this._setupData();
  }

  _setupData() {
    this._propertyValueService.editModeData = this.editModeData;
    this._propertyValueService.propertyDefinition = this.propertyDefinition;
    this._propertyValueService.formArray = this.formArray;
    this._propertyValueService.cardinality = this.myProperty.guiDef.cardinality;
  }
}
