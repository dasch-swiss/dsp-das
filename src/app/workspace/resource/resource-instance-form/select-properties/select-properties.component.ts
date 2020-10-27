import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CardinalityUtil, ReadResource, ResourceClassAndPropertyDefinitions, ResourceClassDefinition, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { ValueTypeService } from '@dasch-swiss/dsp-ui';
import { SwitchPropertiesComponent } from './switch-properties/switch-properties.component';

export interface Properties {
    [index: string]: ResourcePropertyDefinition;
}

@Component({
  selector: 'app-select-properties',
  templateUrl: './select-properties.component.html',
  styleUrls: ['./select-properties.component.scss']
})
export class SelectPropertiesComponent implements OnInit {

    @ViewChild('switchProp') switchPropertiesComponent: SwitchPropertiesComponent;

    @Input() propertiesAsArray: Array<ResourcePropertyDefinition>;

    @Input() ontologyInfo: ResourceClassAndPropertyDefinitions;

    @Input() resourceClass: ResourceClassDefinition;

    @Input() parentForm: FormGroup;

    parentResource = new ReadResource();

    propId: string;
    addButtonIsVisible: boolean;
    addValueFormIsVisible: boolean;

    index = 0;

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

    /**
     * Given a resource property, check if an add button should be displayed under the property values
     *
     * @param prop the resource property
     */
    addValueIsAllowed(prop: ResourcePropertyDefinition): any {

        const isAllowed = CardinalityUtil.createValueForPropertyAllowed(
            prop.id, 0, this.ontologyInfo.classes[this.resourceClass.id]);

        // check if:
        // cardinality allows for a value to be added
        return isAllowed;
    }

    /**
     * Called from the template when the user clicks on the add button
     */
    showAddValueForm(prop: ResourcePropertyDefinition) {
        console.log('showAddValueForm');
        this.propId = prop.id;
        this.addValueFormIsVisible = true;
    }

    /**
     * Given a resource property, returns the label if one exists plus an index
     * If the property does not have a label, it returns 'Untitled FormGroup' plus an index
     *
     * Used to create the FormGroup name to add to the parent FormGroup because each name needs to be unique
     *
     * @param prop the resource property
     */
    getFormControlName(prop: ResourcePropertyDefinition): string {
        this.index += 1;
        return prop.label ? prop.label + this.index : 'Untitled FormGroup' + this.index;
    }

}
