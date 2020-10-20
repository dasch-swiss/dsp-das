import { Component, Input, ViewChild } from '@angular/core';
import { Constants, ReadResource, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { BaseValueDirective } from 'src/app/base-value.component';

export interface Properties {
    [index: string]: ResourcePropertyDefinition;
}

@Component({
  selector: 'app-select-properties',
  templateUrl: './select-properties.component.html',
  styleUrls: ['./select-properties.component.scss']
})
export class SelectPropertiesComponent {

    @ViewChild('createVal') createValueComponent: BaseValueDirective;

    @Input() propertiesAsArray: Array<ResourcePropertyDefinition>;

    parentResource = new ReadResource();

    mode = 'create';
    constants = Constants;

    constructor() { }

}
