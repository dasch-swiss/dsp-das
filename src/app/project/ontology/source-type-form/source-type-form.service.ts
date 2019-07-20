import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, Form } from '@angular/forms';
import { Property } from './_models/property.model';
import { SourceType } from './_models/source-type.model';
import { PropertyForm } from './_models/property-form.model';
import { SourceTypeForm } from './_models/source-type-form.model';

@Injectable({
    providedIn: 'root'
})
export class SourceTypeFormService {

    private sourceTypeForm: BehaviorSubject<FormGroup | undefined> = new BehaviorSubject(this._fb.group(
        new SourceTypeForm(new SourceType('', ''))
    ));

    sourceTypeForm$: Observable<FormGroup> = this.sourceTypeForm.asObservable();

    constructor (private _fb: FormBuilder) { }

    // reset
    resetProperties() {

        const currentSourceType = this._fb.group(
            new SourceTypeForm(new SourceType('', ''))
        );

        this.sourceTypeForm.next(currentSourceType);
    }

    addProperty() {
        const currentSourceType = this.sourceTypeForm.getValue();
        const currentProperties = currentSourceType.get('properties') as FormArray;

        currentProperties.push(
            this._fb.group(
                new PropertyForm(new Property('', '', false, false, ''))
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
