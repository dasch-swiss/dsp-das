import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatIconRegistry } from '@angular/material';
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
            label: 'Text',
            elements: [
                {
                    icon: 'short_text',
                    label: 'Short',
                    value: 'TextValue',
                    gui_ele: 'Input',
                    group: 'Text'   // this information is redundant, but I can't solve it with the group label above
                },
                {
                    icon: 'subject',
                    label: 'Paragraph',
                    value: 'TextValue',
                    gui_ele: 'Textarea',
                    group: 'Text'
                },
                {
                    icon: 'line_style',
                    label: 'Editor',
                    value: 'TextValue/richtext',
                    gui_ele: 'Richtext',
                    group: 'Text'
                }
            ]
        },
        {
            label: 'List',
            elements: [
                {
                    icon: 'radio_button_checked',
                    label: 'Multiple choice',
                    value: 'ListValue',
                    gui_ele: 'Radio',
                    group: 'List'
                },
                {
                    icon: 'check_box',
                    label: 'Checkboxes',
                    value: 'ListValue',
                    gui_ele: 'Checkbox',
                    group: 'List'
                },
                {
                    icon: 'arrow_drop_down_circle',
                    label: 'Dropdown',
                    value: 'ListValue',
                    gui_ele: 'Dropdown',
                    group: 'List'
                },
                {
                    icon: 'toggle_off',
                    label: 'On / Off',
                    value: 'BooleanValue',
                    gui_ele: 'Toggle',
                    group: 'List'
                }
            ]
        },
        {
            label: 'Date / Time',
            elements: [
                {
                    icon: 'calendar_today',
                    label: 'Date',
                    value: 'DateValue',
                    gui_ele: 'Datepicker',
                    group: 'Date / Time'
                },
                {
                    icon: 'date_range',
                    label: 'Period',
                    value: 'DateValue',
                    gui_ele: 'Datepicker',
                    group: 'Date / Time'
                },
                {
                    icon: 'access_time',
                    label: 'Time',
                    value: 'IntervalValue',
                    gui_ele: 'Time',
                    group: 'Date / Time'
                },
                {
                    icon: 'timelapse',
                    label: 'Duration',
                    value: 'IntervalValue',
                    gui_ele: 'Number',
                    group: 'Date / Time'
                }
            ]
        },
        {
            label: 'Number',
            elements: [
                {
                    icon: 'integer_icon',
                    label: 'Integer',
                    value: 'IntValue',
                    gui_ele: 'Number',
                    group: 'Number'
                },
                {
                    icon: 'decimal_icon',
                    label: 'Decimal',
                    value: 'DecimalValue',
                    gui_ele: 'Number',
                    group: 'Number'
                }
            ]
        },
        {
            label: 'Link',
            elements: [
                {
                    icon: 'link',
                    label: 'Other resource e.g. Person',
                    value: 'LinkValue',
                    gui_ele: 'Autocomplete',
                    group: 'Link'
                },
                {
                    icon: 'compare_arrows',
                    label: 'External resource',
                    value: 'ExternalResValue',
                    gui_ele: 'Input',
                    group: 'Link'
                },
                {
                    icon: 'http',
                    label: 'External URL',
                    value: 'UriValue',
                    gui_ele: 'Url',
                    group: 'Link'
                }
            ]
        },
        {
            label: 'Location',
            elements: [
                {
                    icon: 'place',
                    label: 'Place',
                    value: 'GeonameValue',
                    gui_ele: 'Geonames',
                    group: 'Location'
                }
            ]
        },
        {
            label: 'Shape',
            elements: [
                {
                    icon: 'color_lens',
                    label: 'Color',
                    value: 'ColorValue',
                    gui_ele: 'Colorpicker',
                    group: 'Shape'
                },
                {
                    icon: 'format_shapes',
                    label: 'Geometry',
                    value: 'GeomValue',
                    gui_ele: 'Geometry',
                    group: 'Shape'
                }
            ]
        }
    ];


    // index of the given property (unique)
    // index: number;

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
            'decimal_icon',
            this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/decimal-icon.svg')
        );
    }

    ngOnInit() {

        this.propertyForm.patchValue({ type: this.valueTypes[0].elements[0] });

    }

    updateAttributeField(type: any) {

        // depending on the selected property type,
        // we have to define gui element attributes
        // e.g. iri of list or connected resource type
        switch (type.value) {
            case 'ListValue':

                break;

            case 'LinkValue':

                break;

            default:




        }

    }

}
