import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatIconRegistry, MatSelectChange } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { DefaultPropertyType, PropertyTypes } from '../../default-data/poperty-types';

// https://stackoverflow.com/questions/45661010/dynamic-nested-reactive-form-expressionchangedafterithasbeencheckederror
const resolvedPromise = Promise.resolve(null);

@Component({
    selector: 'app-source-type-property',
    templateUrl: './source-type-property.component.html',
    styleUrls: ['./source-type-property.component.scss']
})
export class SourceTypePropertyComponent implements OnInit {

    @Input() propertyForm: FormGroup;

    @Input() index: number;

    @Output() deleteProperty: EventEmitter<number> = new EventEmitter();

    name = new FormControl();
    label = new FormControl();
    type = new FormControl();
    multiple = new FormControl();
    required = new FormControl();
    // permission = new FormControl();

    // selection of default property types
    propertyTypes: DefaultPropertyType[] = PropertyTypes.data;

    showGuiAttr: boolean = false;



    selectTypeLabel: string; // = this.propertyTypes[0].group + ': ' + this.propertyTypes[0].elements[0].label;
    selectedGroup: string;



    // index of the given property (unique)
    // index: number;

    constructor(
        @Inject(FormBuilder) private _fb: FormBuilder,
        private _domSanitizer: DomSanitizer,
        private _matIconRegistry: MatIconRegistry) {

        // special icons for property type
        this._matIconRegistry.addSvgIcon(
            'integer_icon',
            this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/integer-icon.svg')
        );
        this._matIconRegistry.addSvgIcon(
            'decimal_icon',
            this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/decimal-icon.svg')
        );
    }

    ngOnInit() {

        if (this.propertyForm) {
            // init list of property types with first element
            this.propertyForm.patchValue({ type: this.propertyTypes[0].elements[0] });
        }

    }

    updateAttributeField(event: MatSelectChange) {

        // depending on the selected property type,
        // we have to define gui element attributes
        // e.g. iri of list or connected resource type
        switch (event.value.subPropOf) {
            case 'knora-api:ListValue':
                this.showGuiAttr = true;
                break;

            case 'knora-api:LinkValue':
                this.showGuiAttr = true;
                break;

            default:
                this.showGuiAttr = false;
        }



    }

}
