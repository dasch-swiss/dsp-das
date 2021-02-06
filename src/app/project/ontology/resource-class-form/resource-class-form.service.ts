import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Cardinality, IHasProperty, PropertyDefinition, ResourceClassDefinition, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { DefaultProperties, PropertyType } from '../default-data/default-properties';

// property data structure
export class Property {
    iri: string;
    label: string;
    type: PropertyType;
    multiple: boolean;
    required: boolean;
    guiAttr: string;
    // permission: string;

    constructor(
        iri?: string,
        label?: string,
        type?: any,
        multiple?: boolean,
        required?: boolean,
        guiAttr?: string
        // permission?: string
    ) {
        this.iri = iri;
        this.label = label;
        this.type = type;
        this.multiple = multiple;
        this.required = required;
        this.guiAttr = guiAttr;
        // this.permission = permission;
    }
}


// property form controls
export class PropertyForm {
    iri = new FormControl();
    label = new FormControl();
    type = new FormControl();
    multiple = new FormControl();
    required = new FormControl();
    guiAttr = new FormControl();
    // permission = new FormControl();

    constructor(
        property: Property
    ) {
        this.iri.setValue(property.iri);

        this.label.setValue(property.label);
        this.label.setValidators([Validators.required]);

        this.type.setValue(property.type);
        this.type.setValidators([Validators.required]);

        this.multiple.setValue(property.multiple);

        this.required.setValue(property.required);

        this.guiAttr.setValue(property.guiAttr);

        // this.permission.setValue(property.permission);
        // TODO: permission is not implemented yet
        // this.permission.setValidators([Validators.required]);
    }
}

// resource class data structure
export class ResourceClass {
    properties: Property[];

    constructor(properties?: Property[]) {
        this.properties = properties;
    }
}


// resource class form controls
export class ResourceClassForm {
    properties = new FormArray([]);

    constructor(resourceClass: ResourceClass) {
        if (resourceClass.properties) {
            let i = 0;
            this.properties.setControl
            resourceClass.properties.forEach(prop => {
                this.properties[i] = new FormControl(prop);
                // this.properties[i].setValue(prop);
                i++;
            });
            // this.properties.setValue([resourceClass.properties]);
        }
    }
}

@Injectable({
    providedIn: 'root'
})
export class ResourceClassFormService {

    private resourceClassForm: BehaviorSubject<FormGroup | undefined> = new BehaviorSubject(this._fb.group(
        new ResourceClassForm(new ResourceClass())
    ));

    resourceClassForm$: Observable<FormGroup> = this.resourceClassForm.asObservable();

    constructor(private _fb: FormBuilder) { }

    /**
     * reset all properties
     */
    resetProperties() {

        const currentResourceClass = this._fb.group(
            new ResourceClassForm(new ResourceClass())
        );

        this.resourceClassForm.next(currentResourceClass);
    }

    /**
     * Sets properties in case of update resource class' cardinalities
     * @param resClass
     */
    setProperties(resClass: ResourceClassDefinition, ontoProperties: PropertyDefinition[]) {

        const updateResClass = new ResourceClass();

        updateResClass.properties = [];

        // get cardinality and gui order and grab property definition
        resClass.propertiesList.forEach((prop: IHasProperty) => {
            if (prop.guiOrder >= 0) {
                const property: Property = new Property();
                property.iri = prop.propertyIndex;

                // convert cardinality
                switch(prop.cardinality) {
                    case 0:
                        property.multiple = false;
                        property.required = true;
                    break;
                    case 1:
                        property.multiple = false;
                        property.required = false;
                    break;
                    case 2:
                        property.multiple = true;
                        property.required = false;
                    break;
                    case 3:
                        property.multiple = true;
                        property.required = true;
                    break;
                }

                // get property definition
                Object.keys(ontoProperties).forEach(key => {
                    if (ontoProperties[key].id === property.iri) {
                        const propDef: ResourcePropertyDefinition = ontoProperties[key];
                        property.label = propDef.label;

                        // find property type in list of default properties
                        // just a test
                        // property.type = DefaultProperties.data[0].elements[0];

                        property.guiAttr = propDef.guiAttributes[0];
                    }
                });

                this.addProperty(property);

            }

        });

    }


    /**
     * add new property line
     */
    addProperty(prop?: Property) {
        const currentResourceClass = this.resourceClassForm.getValue();
        const currentProperties = currentResourceClass.get('properties') as FormArray;

        currentProperties.push(
            this._fb.group(
                new PropertyForm((prop ? prop : new Property('', '', {}, false, false)))
            )
        );

        this.resourceClassForm.next(currentResourceClass);
    }
    /**
     * delete property line by index i
     *
     * @param  {number} i
     */
    removeProperty(i: number) {
        const currentResourceClass = this.resourceClassForm.getValue();
        const currentProperties = currentResourceClass.get('properties') as FormArray;

        currentProperties.removeAt(i);
        this.resourceClassForm.next(currentResourceClass);
    }

    /**
     * Create a unique name (id) for resource classes or properties;
     *
     * @param ontologyIri
     * @param [label]
     * @returns unique name
     */
    setUniqueName(ontologyIri: string, label?: string, type?: 'class' | 'prop'): string {

        if (label && type) {
            // build name from label
            // normalize and replace spaces and special chars
            return type + '-' + label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u00a0-\u024f]/g, '').replace(/[\])}[{(]/g, '').replace(/\s+/g, '-').replace(/\//g, '-').toLowerCase();
        } else {
            // build randomized name
            // The name starts with the three first character of ontology iri to avoid a start with a number followed by randomized string
            return this.getOntologyName(ontologyIri).substring(0, 3) + Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
        }
    }

    /**
     * Get the ontolgoy name from ontology iri
     *
     * @param  {string} ontologyIri
     * @returns string
     */
    getOntologyName(ontologyIri: string): string {

        const array = ontologyIri.split('/');

        const pos = array.length - 2;

        return array[pos].toLowerCase();
    }

    /**
     * Convert cardinality values (multiple? & required?) from form to DSP-JS cardinality enum 1-n, 0-n, 1, 0-1
     * @param  {boolean} multiple
     * @param  {boolean} required
     * @returns Cardinality
     */
    translateCardinality(multiple: boolean, required: boolean): Cardinality {

        if (multiple && required) {
            // Cardinality 1-n (at least one)
            return Cardinality._1_n;
        } else if (multiple && !required) {
            // Cardinality 0-n (may have many)
            return Cardinality._0_n;
        } else if (!multiple && required) {
            // Cardinality 1 (required)
            return Cardinality._1;
        } else {
            // Cardinality 0-1 (optional)
            return Cardinality._0_1;
        }
    }

}
