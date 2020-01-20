import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

// property data structure
export class Property {

    label: string;
    type: any;
    multiple: boolean;
    required: boolean;
    permission: string;

    constructor(
        label?: string,
        type?: any,
        multiple?: boolean,
        required?: boolean,
        permission?: string
    ) {
        this.label = label;
        this.type = type;
        this.multiple = multiple;
        this.required = required;
        this.permission = permission;
    }
}


// property form controls
export class PropertyForm {
    label = new FormControl();
    type = new FormControl();
    multiple = new FormControl();
    required = new FormControl();
    permission = new FormControl();

    constructor(
        property: Property
    ) {
        this.label.setValue(property.label);
        this.label.setValidators([Validators.required]);

        this.type.setValue(property.type);
        this.type.setValidators([Validators.required]);

        this.multiple.setValue(property.multiple);

        this.required.setValue(property.required);

        this.permission.setValue(property.permission);
        // TODO: permission is not implemented yet
        // this.permission.setValidators([Validators.required]);
    }
}

// source type data structure
export class SourceType {
    // label: string;
    // comment: string;
    permission: string;
    // subClassOf: string;
    properties: Property[];

    constructor(permission: string, properties?: Property[]) {
        // this.label = label;
        // this.comment = comment;
        this.permission = permission;
        // this.subClassOf = subClassOf;
        this.properties = properties;
    }
}


// source type form controls
export class SourceTypeForm {
    // label = new FormControl();
    // comment = new FormControl();
    permission = new FormControl();
    // subClassOf = new FormControl();
    properties = new FormArray([]);

    constructor(sourceType: SourceType) {

        // this.label.setValue(sourceType.label);
        // this.label.setValidators([Validators.required]);

        // this.comment.setValue(sourceType.comment);

        // this.subClassOf.setValue(sourceType.subClassOf);

        this.permission.setValue(sourceType.permission);

        if (sourceType.properties) {
            this.properties.setValue([sourceType.properties]);
        }
    }
}

@Injectable({
    providedIn: 'root'
})
export class SourceTypeFormService {

    private sourceTypeForm: BehaviorSubject<FormGroup | undefined> = new BehaviorSubject(this._fb.group(
        new SourceTypeForm(new SourceType(''))
    ));

    sourceTypeForm$: Observable<FormGroup> = this.sourceTypeForm.asObservable();

    constructor(private _fb: FormBuilder) { }

    // reset
    resetProperties() {

        const currentSourceType = this._fb.group(
            new SourceTypeForm(new SourceType(''))
        );

        this.sourceTypeForm.next(currentSourceType);
    }

    addProperty() {
        const currentSourceType = this.sourceTypeForm.getValue();
        const currentProperties = currentSourceType.get('properties') as FormArray;

        console.log('currentProperties', currentProperties);

        currentProperties.push(
            this._fb.group(
                new PropertyForm(new Property('', {}, false, false, ''))
            )
        );

        this.sourceTypeForm.next(currentSourceType);
    }

    removeProperty(i: number) {
        const currentSourceType = this.sourceTypeForm.getValue();
        const currentProperties = currentSourceType.get('properties') as FormArray;

        currentProperties.removeAt(i);
        this.sourceTypeForm.next(currentSourceType);
    }
}
