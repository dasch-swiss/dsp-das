import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

// property data structure
export class Property {

    name: string;
    label: string;
    type: any;
    multiple: boolean;
    required: boolean;
    guiAttr: string;
    // permission: string;

    constructor(
        name?: string,
        label?: string,
        type?: any,
        multiple?: boolean,
        required?: boolean,
        guiAttr?: string
        // permission?: string
    ) {
        this.name = name;
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
    name = new FormControl();
    label = new FormControl();
    type = new FormControl();
    multiple = new FormControl();
    required = new FormControl();
    guiAttr = new FormControl();
    // permission = new FormControl();

    constructor(
        property: Property
    ) {
        this.name.setValue(property.name);
        this.name.setValidators([Validators.required]);

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
    name: string;
    properties: Property[];

    constructor(name: string, properties?: Property[]) {
        this.name = name;
        this.properties = properties;
    }
}


// resource class form controls
export class ResourceClassForm {
    name = new FormControl();
    properties = new FormArray([]);

    constructor(resourceClass: ResourceClass) {
        this.name.setValue(resourceClass.name);

        if (resourceClass.properties) {
            this.properties.setValue([resourceClass.properties]);
        }
    }
}

@Injectable({
    providedIn: 'root'
})
export class ResourceClassFormService {

    private resourceClassForm: BehaviorSubject<FormGroup | undefined> = new BehaviorSubject(this._fb.group(
        new ResourceClassForm(new ResourceClass(''))
    ));

    resourceClassForm$: Observable<FormGroup> = this.resourceClassForm.asObservable();

    constructor(private _fb: FormBuilder) { }

    // reset
    resetProperties() {

        const currentResourceClass = this._fb.group(
            new ResourceClassForm(new ResourceClass(''))
        );

        this.resourceClassForm.next(currentResourceClass);
    }

    addProperty() {
        const currentResourceClass = this.resourceClassForm.getValue();
        const currentProperties = currentResourceClass.get('properties') as FormArray;

        currentProperties.push(
            this._fb.group(
                new PropertyForm(new Property('', '', {}, false, false))
            )
        );

        this.resourceClassForm.next(currentResourceClass);
    }

    removeProperty(i: number) {
        const currentResourceClass = this.resourceClassForm.getValue();
        const currentProperties = currentResourceClass.get('properties') as FormArray;

        currentProperties.removeAt(i);
        this.resourceClassForm.next(currentResourceClass);
    }
}
