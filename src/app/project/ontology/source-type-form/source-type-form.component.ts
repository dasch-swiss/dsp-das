import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectorRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, Form } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SourceTypeFormService } from './source-type-form.service';

@Component({
    selector: 'app-source-type-form',
    templateUrl: './source-type-form.component.html',
    styleUrls: ['./source-type-form.component.scss']
})
export class SourceTypeFormComponent implements OnInit, OnDestroy, AfterViewChecked {

    loading: boolean = true;

    errorMessage: any;

    // sourceType: any;

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
    // @ViewChildren('property') propertyComponents: QueryList<SourceTypePropertyComponent>;

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
     * form group, form array (for properties) errors and validation messages
     */
    sourceTypeForm: FormGroup;

    sourceTypeFormSub: Subscription;

    properties: FormArray;

    loadingNewProp: boolean = false;

    // form validation status
    formValid: boolean = false;

    formErrors = {
        'label': ''
    };

    validationMessages = {
        'label': {
            'required': 'Label is required.'
        },
    };

    constructor (
        private _cdr: ChangeDetectorRef,
        private _fb: FormBuilder,
        private _sourceTypeFormService: SourceTypeFormService
    ) { }

    ngOnInit() {

        this._sourceTypeFormService.resetProperties();

        this.sourceTypeFormSub = this._sourceTypeFormService.sourceTypeForm$
            .subscribe(sourceType => {
                this.sourceTypeForm = sourceType;

                // this.properties = new FormArray([]);
                this.properties = this.sourceTypeForm.get('properties') as FormArray;
            });
        // load one first property line
        this.addProperty();

        this.sourceTypeForm.statusChanges.subscribe((data) => {

            this.formValid = (this.sourceTypeForm.valid && this.properties.valid);
        });

        this.loading = false;

    }

    ngOnDestroy() {
        this.sourceTypeFormSub.unsubscribe();
    }

    ngAfterViewChecked() {
        this._cdr.detectChanges();
    }

    buildForm() {

        this._sourceTypeFormService.resetProperties();

        this.sourceTypeForm = this._fb.group({
            'label': new FormControl({
                value: '', disabled: false
            }, [
                    Validators.required
                ]
            ),
            'permission': new FormControl({
                value: '', disabled: false
            }, [
                    Validators.required
                ]
            )

        });

        this.loading = false;
    }

    addProperty() {
        this._sourceTypeFormService.addProperty();
    }


    removeProperty(index: number) {
        this._sourceTypeFormService.removeProperty(index);
    }

    handlePropertyData(data: any) {
        console.log(data);
    }

    drop(event: CdkDragDrop<string[]>) {
        // moveItemInArray(this.properties, event.previousIndex, event.currentIndex);
    }

    // submit, reset form

    submitData() {
        this.loading = true;
        // TODO: submit data
        console.log('form value:', this.sourceTypeForm.value);

        // close the dialog box
        this.closeMessage();
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
        this.sourceTypeForm.reset();
        this.sourceTypeFormSub.unsubscribe();
        this.closeDialog.emit();
    }
}
