import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// https://stackoverflow.com/questions/45661010/dynamic-nested-reactive-form-expressionchangedafterithasbeencheckederror
const resolvedPromise = Promise.resolve(null);

@Component({
    selector: 'app-source-type-property',
    templateUrl: './source-type-property.component.html',
    styleUrls: ['./source-type-property.component.scss']
})
export class SourceTypePropertyComponent implements OnInit, OnDestroy {

    @Input() properties: any[];

    // parent FormGroup
    @Input() formGroup: FormGroup;

    // index of the given property (unique)
    index: number;

    // unique name for this property to be used in the parent FormGroup
    propIndex: string;

    form: FormGroup;

    constructor (@Inject(FormBuilder) private fb: FormBuilder) { }

    ngOnInit() {

        this.properties = [
            {
                label: '',
                type: '',
                cardinality: '',
                order: '0',
                permissions: ''
            }
        ];


        // build a form for the property selection
        this.form = this.fb.group({
            property: [null, Validators.required],
            isSortCriterion: [false, Validators.required]
        });

        // update the selected property
        this.form.valueChanges.subscribe((data) => {

        });


        resolvedPromise.then(() => {
            this.propIndex = 'prop_' + this.index;

            // add form to the parent form group
            this.formGroup.addControl(this.propIndex, this.form);
        });
    }


    ngOnDestroy() {

        // remove form from the parent form group
        resolvedPromise.then(() => {
            this.formGroup.removeControl(this.propIndex);
        });
    }


}
