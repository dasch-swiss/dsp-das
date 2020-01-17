import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatIconRegistry, MatOptionSelectionChange, MatSelectChange } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

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

    // TODO: move it into a main json file and optimize it: set iris of main class
    valueTypes: any[] = [
        {
            group: 'Text',
            elements: [
                {
                    icon: 'short_text',
                    label: 'Short',
                    subClassOf: 'knora-api:TextValue',
                    gui_ele: 'Input',
                    group: 'Text'       // redundant information, but we don't get the main group name after select type
                },
                {
                    icon: 'subject',
                    label: 'Paragraph',
                    subClassOf: 'knora-api:TextValue',
                    gui_ele: 'Textarea',
                    group: 'Text'
                },
                {
                    icon: 'line_style',
                    label: 'Editor',
                    subClassOf: 'knora-api:TextValue/richtext',
                    gui_ele: 'Richtext',
                    group: 'Text'
                }
            ]
        },
        {
            group: 'List',
            elements: [
                {
                    icon: 'radio_button_checked',
                    label: 'Multiple choice',
                    subClassOf: 'knora-api:ListValue',
                    gui_ele: 'Radio',
                    group: 'List'
                },
                {
                    icon: 'check_box',
                    label: 'Checkboxes',
                    subClassOf: 'knora-api:ListValue',
                    gui_ele: 'Checkbox',
                    group: 'List'
                },
                {
                    icon: 'arrow_drop_down_circle',
                    label: 'Dropdown',
                    subClassOf: 'knora-api:ListValue',
                    gui_ele: 'Dropdown',
                    group: 'List'
                },
                {
                    icon: 'toggle_off',
                    label: 'On / Off',
                    subClassOf: 'knora-api:BooleanValue',
                    gui_ele: 'Toggle',
                    group: 'List'
                }
            ]
        },
        {
            group: 'Date / Time',
            elements: [
                {
                    icon: 'calendar_today',
                    label: 'Date',
                    subClassOf: 'knora-api:DateValue',
                    gui_ele: 'Datepicker',
                    group: 'Date / Time'
                },
                {
                    icon: 'date_range',
                    label: 'Period',
                    subClassOf: 'knora-api:DateValue',
                    gui_ele: 'Datepicker',
                    group: 'Date / Time'
                },
                {
                    icon: 'access_time',
                    label: 'Time',
                    subClassOf: 'knora-api:IntervalValue',
                    gui_ele: 'Time',
                    group: 'Date / Time'
                },
                {
                    icon: 'timelapse',
                    label: 'Duration',
                    subClassOf: 'knora-api:IntervalValue',
                    gui_ele: 'Number',
                    group: 'Date / Time'
                }
            ]
        },
        {
            group: 'Number',
            elements: [
                {
                    icon: 'integer_icon',
                    label: 'Integer',
                    subClassOf: 'knora-api:IntValue',
                    gui_ele: 'Number',
                    group: 'Number'
                },
                {
                    icon: 'decimal_icon',
                    label: 'Decimal',
                    subClassOf: 'knora-api:DecimalValue',
                    gui_ele: 'Number',
                    group: 'Number'
                }
            ]
        },
        {
            group: 'Link',
            elements: [
                {
                    icon: 'link',
                    label: 'Other resource e.g. Person',
                    subClassOf: 'knora-api:LinkValue',
                    gui_ele: 'Autocomplete',
                    group: 'Link'
                },
                {
                    icon: 'compare_arrows',
                    label: 'External resource',
                    subClassOf: 'knora-api:ExternalResValue',
                    gui_ele: 'Input',
                    group: 'Link'
                },
                {
                    icon: 'http',
                    label: 'External URL',
                    subClassOf: 'knora-api:UriValue',
                    gui_ele: 'Url',
                    group: 'Link'
                }
            ]
        },
        {
            group: 'Location',
            elements: [
                {
                    icon: 'place',
                    label: 'Place',
                    subClassOf: 'knora-api:GeonameValue',
                    gui_ele: 'Geonames',
                    group: 'Location'
                }
            ]
        },
        {
            group: 'Shape',
            elements: [
                {
                    icon: 'color_lens',
                    label: 'Color',
                    subClassOf: 'knora-api:ColorValue',
                    gui_ele: 'Colorpicker',
                    group: 'Shape'
                }
            ]
        }
    ];



    selectTypeLabel: string; // = this.valueTypes[0].group + ': ' + this.valueTypes[0].elements[0].label;
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
            this.propertyForm.patchValue({ type: this.valueTypes[0].elements[0] });
        }

    }

    updateAttributeField(event: MatSelectChange) {

        // depending on the selected property type,
        // we have to define gui element attributes
        // e.g. iri of list or connected resource type
        switch (event.source.value.subClassOf) {
            case 'ListValue':

                break;

            case 'LinkValue':

                break;

            default:
        }



    }

}
