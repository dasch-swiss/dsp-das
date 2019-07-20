import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SourceTypeFormService } from './source-type-form.service';

// nested form components; solution from here:
// https://medium.com/@joshblf/dynamic-nested-reactive-forms-in-angular-654c1d4a769a

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

            this.formValid = this.sourceTypeForm.valid && this.properties.valid;
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

        this.loading = true;
        this.formValid = false;

        this._sourceTypeFormService.resetProperties();

        this.sourceTypeFormSub = this._sourceTypeFormService.sourceTypeForm$
            .subscribe(sourceType => {
                this.sourceTypeForm = sourceType;

                // this.properties = new FormArray([]);
                this.properties = this.sourceTypeForm.get('properties') as FormArray;
            });

        // load one first property line
        this.addProperty();

        this.loading = false;
    }

    addProperty() {
        this._sourceTypeFormService.addProperty();
        this.formValid = !this.properties.valid;
    }

    removeProperty(index: number) {
        this._sourceTypeFormService.removeProperty(index);
    }

    handlePropertyData(data: any) {
        console.log(data);
    }

    drop(event: CdkDragDrop<string[]>) {

        // set sort order for child component
        moveItemInArray(this.properties.controls, event.previousIndex, event.currentIndex);

        // set sort order in form value
        moveItemInArray(this.sourceTypeForm.value.properties, event.previousIndex, event.currentIndex);
    }

    // submit, reset form

    submitData() {
        this.loading = true;
        // TODO: submit data
        // build JSON similar tho Knora-PY JSON from Lukas
        // and submit data
        console.log('sourceTypeForm:', this.sourceTypeForm.value);


        const resourceProperties: any = [];
        let i = 0;
        for (const prop of this.sourceTypeForm.value.properties) {
            const newProp: any = {
                value: prop.type.value,
                gui_element: prop.type.gui_ele,
                gui_order: i,
                cardinality: this.setCardinality(prop.multiple, prop.requirerd),
                gui_attr: 'TODO: implement gui attributes'
            };

            resourceProperties.push(newProp);

            i++;
        }

        console.log(resourceProperties);

        // close the dialog box
        this.closeMessage();
    }

    setCardinality(multiple: boolean, required: boolean): string {
        // result should be:
        // "1", "0-1", "1-n", "0-n"
        if (multiple && required) {
            return '1-n';
        } else if (multiple && !required) {
            return '0-n';
        } else if (!multiple && required) {
            return '1';
        } else {
            return '0-1';
        }
    }


    /**
     * Reset the form
     */
    resetForm(ev: Event, sourceType?: any) {

        this.buildForm();

    }

    closeMessage() {
        this.sourceTypeForm.reset();
        this.sourceTypeFormSub.unsubscribe();
        this.closeDialog.emit();
    }
}
