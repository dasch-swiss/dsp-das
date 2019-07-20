import { Component, Inject, Input, OnDestroy, OnInit, Output, EventEmitter, AfterViewChecked, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { Property } from '@knora/core';

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

    label = new FormControl();
    type = new FormControl();
    multiple = new FormControl();
    required = new FormControl();
    permission = new FormControl();

    @Input() properties: any[];

    // parent FormGroup
    @Input() formGroup: FormGroup;

    @Output() submitDataToParent: EventEmitter<any> = new EventEmitter<any>();

    // TODO: move it into a main json file and optimize it: set iris of main class
    valueTypes: any[] = [
        {
            label: 'Text',
            elements: [
                {
                    icon: 'short_text',
                    label: 'Short',
                    id: ''
                },
                {
                    icon: 'subject',
                    label: 'Paragraph',
                    id: ''
                }
            ]
        },
        {
            label: 'List',
            elements: [
                {
                    icon: 'radio_button_checked',
                    label: 'Multiple choice',
                    id: ''
                },
                {
                    icon: 'check_box',
                    label: 'Checkboxes',
                    id: ''
                },
                {
                    icon: 'arrow_drop_down_circle',
                    label: 'Dropdown',
                    id: ''
                },
                {
                    icon: 'toggle_off',
                    label: 'On / Off',
                    id: ''
                }
            ]
        },
        {
            label: 'Date / Time',
            elements: [
                {
                    icon: 'calendar_today',
                    label: 'Date',
                    id: ''
                },
                {
                    icon: 'access_time',
                    label: 'Time',
                    id: ''
                }
            ]
        },
        {
            label: 'Number',
            elements: [
                {
                    icon: 'integer_icon',
                    label: 'Integer',
                    id: ''
                },
                {
                    icon: 'floating_icon',
                    label: 'Floating',
                    id: ''
                }
            ]
        },
        {
            label: 'Color',
            elements: [
                {
                    icon: 'color_lens',
                    label: 'Color',
                    id: ''
                }
            ]
        },
        {
            label: 'Location',
            elements: [
                {
                    icon: 'map',
                    label: 'Geoname',
                    id: ''
                }
            ]
        },
        {
            label: 'Link',
            elements: [
                {
                    icon: 'http',
                    label: 'External URL',
                    id: ''
                },
                {
                    icon: 'link',
                    label: 'Link to other source',
                    id: ''
                }
            ]
        }
    ];

    // index of the given property (unique)
    // index: number;

    // unique name for this property to be used in the parent FormGroup
    propIndex: string;

    propForm: FormGroup;

    constructor (
        @Inject(FormBuilder) private _fb: FormBuilder,
        private _domSanitizer: DomSanitizer,
        private _matIconRegistry: MatIconRegistry) {

        // special icons for property type
        this._matIconRegistry.addSvgIcon(
            'integer_icon',
            this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/integer-icon.svg')
        );
        this._matIconRegistry.addSvgIcon(
            'floating_icon',
            this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/floating-icon.svg')
        );
    }

    ngOnInit() {

        // build a form for the property selection
        /*
        this.propForm = this._fb.group({
            'label': new FormControl({
                value: '', disabled: false
            }, [
                    Validators.required
                ]
            ),
            'type': new FormControl({
                value: '', disabled: false
            }, [
                    Validators.required
                ]
            ),
            'multiple': new FormControl({
                value: '', disabled: false
            }),
            'required': new FormControl({
                value: '', disabled: false
            }),
            'permission': new FormControl({
                value: '', disabled: false
            }, [
                    Validators.required
                ]
            )
        });
        */

        // update the selected property
        /*
        this.propForm.valueChanges.subscribe((data) => {
            if (this.propForm.valid) {
                this.submitDataToParent.emit(data);
            }
        });
        */

        /*
                resolvedPromise.then(() => {
                    this.propIndex = 'prop_' + this.index;

                    // add form to the parent form group
                    this.formGroup.addControl(this.propIndex, this.propForm);
                }); */
    }

}
