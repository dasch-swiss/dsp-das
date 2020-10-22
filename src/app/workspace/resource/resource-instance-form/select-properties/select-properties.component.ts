import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Constants, ReadResource, ResourceClassAndPropertyDefinitions, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { ValueTypeService } from '@dasch-swiss/dsp-ui';
import { BaseValueComponent } from 'src/app/base-value.component';

export interface Properties {
    [index: string]: ResourcePropertyDefinition;
}

@Component({
  selector: 'app-select-properties',
  templateUrl: './select-properties.component.html',
  styleUrls: ['./select-properties.component.scss']
})
export class SelectPropertiesComponent implements OnInit {

    @ViewChild('createVal') createValueComponent: BaseValueComponent;

    @Input() propertiesAsArray: Array<ResourcePropertyDefinition>;

    @Input() ontologyInfo: ResourceClassAndPropertyDefinitions;

    parentResource = new ReadResource();

    mode = 'create';
    constants = Constants;

    constructor(private _valueTypeService: ValueTypeService) { }

    ngOnInit() {

        if (this.propertiesAsArray) {
            for (const prop of this.propertiesAsArray) {
                if (prop) {
                    if (prop.objectType === 'http://api.knora.org/ontology/knora-api/v2#TextValue') {
                        prop.objectType = this._valueTypeService.getTextValueClass(prop);
                    }
                }
            }
        }

        this.parentResource.entityInfo = this.ontologyInfo;
    }

}
