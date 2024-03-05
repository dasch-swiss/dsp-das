import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, UntypedFormGroup } from '@angular/forms';
import {
  Cardinality,
  CardinalityUtil,
  IHasProperty,
  ReadResource,
  ResourceClassAndPropertyDefinitions,
  ResourceClassDefinition,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { BaseValueDirective } from '../../../../main/directive/base-value.directive';
import { ValueService } from '../../services/value.service';
import { SwitchPropertiesComponent } from './switch-properties/switch-properties.component';

@Component({
  selector: 'app-select-properties',
  templateUrl: './select-properties.component.html',
  styleUrls: ['./select-properties.component.scss'],
})
export class SelectPropertiesComponent implements OnInit {
  @ViewChildren('switchProp')
  switchPropertiesComponent: QueryList<SwitchPropertiesComponent>;

  @ViewChild('createVal') createValueComponent: BaseValueDirective;

  @Input() properties: ResourcePropertyDefinition[];

  @Input() ontologyInfo: ResourceClassAndPropertyDefinitions;

  @Input() selectedResourceClass: ResourceClassDefinition;

  @Input() parentForm: UntypedFormGroup;

  @Input() currentOntoIri: string;

  propertyValuesKeyValuePair = {}; // { [index: string]: [number] }

  get propertiesWithoutLink() {
    return this.properties.filter(prop => !prop.isLinkProperty);
  }

  constructor(private _valueService: ValueService) {}

  ngOnInit() {
    for (const prop of this.properties) {
      if (prop.objectType === 'http://api.knora.org/ontology/knora-api/v2#TextValue') {
        prop.objectType = this._valueService.getTextValueClass(prop);
      }

      // each property will have at least one value so add one by default
      this.propertyValuesKeyValuePair[prop.id] = [0];

      // each property will also have a filtered array to be used when deleting a value.
      // see the deleteValue method below for more info
      this.propertyValuesKeyValuePair[`${prop.id}-filtered`] = [0];

      // each property will also have a cardinality array to be used when marking a field as required
      const card = this.selectedResourceClass.propertiesList.find(item => item.propertyIndex === prop.id);
      const isRequiredProp = [Cardinality._1, Cardinality._1_n].includes(card.cardinality);
      this.propertyValuesKeyValuePair[`${prop.id}-cardinality`] = [isRequiredProp ? 1 : 0];
    }
  }
}
