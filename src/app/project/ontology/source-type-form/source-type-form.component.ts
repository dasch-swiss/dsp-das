import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-source-type-form',
    templateUrl: './source-type-form.component.html',
    styleUrls: ['./source-type-form.component.scss']
})
export class SourceTypeFormComponent implements OnInit {

    loading: boolean = true;

    errorMessage: any;

    sourceType: any;

    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();
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
        this.form = this._fb.group({
            'label': new FormControl({
                value: '', disabled: false
            }, [
                    Validators.required
                ])
        });

        this.loading = false;
    }

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
