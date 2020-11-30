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

    propertyValuesKeyValuePair = {}; // { [index: string]: [number] }

    addButtonIsVisible: boolean;

    constructor(private _valueService: ValueService) { }

    ngOnInit() {
        console.log(this.propertiesAsArray);
        if (this.propertiesAsArray) {
            for (const prop of this.propertiesAsArray) {
                if (prop) {
                    if (prop.objectType === 'http://api.knora.org/ontology/knora-api/v2#TextValue') {
                        prop.objectType = this._valueService.getTextValueClass(prop);
                    }

                    // each property will have at least one value so add one by default
                    this.propertyValuesKeyValuePair[prop.id] = [0];
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
        // get the length of the corresponding property values array
        const length = this.propertyValuesKeyValuePair[prop.id].length;

        // reassign the array to a new array with a length of the current length plus 1
        this.propertyValuesKeyValuePair[prop.id] = this.createValueArrayForProperty(length + 1);

        console.log('propertyValues: ', this.propertyValuesKeyValuePair);
        console.log('parent form: ', this.parentForm);
    }

    /**
     * Returns a simple array of incremented numbers
     * Used to generate a new array when reassigning an array to a value in the propertyValuesKeyValuePair object
     * https://lishman.io/using-ngfor-to-repeat-n-times-in-angular
     *
     * @param n number of elements you would like in the array
     */
    private createValueArrayForProperty(n: number): number[] {
        return [...Array(n).keys()];
    }

}

