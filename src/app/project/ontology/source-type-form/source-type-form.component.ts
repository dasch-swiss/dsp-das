import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SourceTypePropertyComponent } from './source-type-property/source-type-property.component';

@Component({
    selector: 'app-source-type-form',
    templateUrl: './source-type-form.component.html',
    styleUrls: ['./source-type-form.component.scss']
})
export class SourceTypeFormComponent implements OnInit {

    loading: boolean = true;

    errorMessage: any;

    sourceType: any;

    properties: any[];


    /**
     * default, base source type iri
     */
    @Input() iri: string;

    /**
     * emit event, when closing dialog
     */
    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    /**
     * reference to the component controlling the property selection
     */
    @ViewChildren('property') propertyComponents: QueryList<SourceTypePropertyComponent>;

    /**
     * success of sending data
     */
    success = false;

    /**
     * message after successful post
     */
    successMessage: any = {
        status: 200,
        statusText: 'You have successfully updated the project data.'
    };

    /**
     * form group, errors and validation messages
     */
    form: FormGroup;

    formErrors = {
        'label': ''
    };

    validationMessages = {
        'label': {
            'required': 'Label is required.'
        },
    };

    constructor (private _fb: FormBuilder) { }

    ngOnInit() {
        this.buildForm();
    }

    buildForm() {

        this.properties = [
            {
                label: '',
                type: '',
                cardinality: '',
                order: '0',
                permissions: ''
            }
        ];
        this.form = this._fb.group({
            'label': new FormControl({
                value: '', disabled: false
            }, [
                    Validators.required
                ])
        });

        this.loading = false;
    }

    // properties
    addNewProperty() {
        this.properties.push(
            {
                label: '',
                type: '',
                cardinality: '',
                order: '0',
                permissions: ''
            }
        );

        console.log(this.properties);
    }

    deleteProperty(index: number) {
        this.properties.splice(index, 1);
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.properties, event.previousIndex, event.currentIndex);
    }


    // submit, reset form

    submitData() {
        this.loading = true;
    }

    /**
     * Reset the form
     */
    resetForm(ev: Event, sourceType?: any) {
        ev.preventDefault();

        // project = (project ? project : new Project());

        this.buildForm();

        // TODO: fix "set value" for keywords field
        //        this.form.controls['keywords'].setValue(this.keywords);
    }

    closeMessage() {
        this.closeDialog.emit();
    }
}
