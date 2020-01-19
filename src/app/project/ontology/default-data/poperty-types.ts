
export interface DefaultPropertyType {
    group: string;
    elements: DefaultValueType[];
}

export interface DefaultValueType {
    icon: string;
    label: string;
    subClassOf: string;
    gui_ele: string;
    group: string;
}

export class PropertyTypes {
    public static data: DefaultPropertyType[] = [
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
}
