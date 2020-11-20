import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CardinalityUtil, ReadResource, ResourceClassAndPropertyDefinitions, ResourceClassDefinition, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { ValueService } from '@dasch-swiss/dsp-ui';
import { SwitchPropertiesComponent } from './switch-properties/switch-properties.component';

export interface Properties {
    [index: string]: ResourcePropertyDefinition;
}

@Component({
  selector: 'app-select-properties',
  templateUrl: './select-properties.component.html',
  styleUrls: ['./select-properties.component.scss']
})
export class SelectPropertiesComponent implements OnInit, AfterViewInit {

    @ViewChildren('switchProp') switchPropertiesComponent: QueryList<SwitchPropertiesComponent>;

    @Input() propertiesAsArray: Array<ResourcePropertyDefinition>;

    @Input() ontologyInfo: ResourceClassAndPropertyDefinitions;

    @Input() resourceClass: ResourceClassDefinition;

    @Input() parentForm: FormGroup;

    parentResource = new ReadResource();

    index = 0;

    // this is used as a general example
    // TODO: use a key value pair to store the amount of select-property components for each property
    valuesArray = [];

    propId: string;
    addButtonIsVisible: boolean;
    addValueFormIsVisible: boolean;

    constructor(private _valueService: ValueService) { }

    ngOnInit() {
        this.valuesArray.push(new SwitchPropertiesComponent());
        if (this.propertiesAsArray) {
            for (const prop of this.propertiesAsArray) {
                if (prop) {
                    if (prop.objectType === 'http://api.knora.org/ontology/knora-api/v2#TextValue') {
                        prop.objectType = this._valueService.getTextValueClass(prop);
                    }
                }
            }
        }

        this.parentResource.entityInfo = this.ontologyInfo;
    }

    ngAfterViewInit() {
        console.log(this.parentForm);
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

        // TODO: use the prop.id to add a component to the key value pair
        this.valuesArray.push(new SwitchPropertiesComponent());
        console.log('parent form: ', this.parentForm);
    }

}

