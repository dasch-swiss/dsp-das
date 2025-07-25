import { Constants } from '@dasch-swiss/dsp-js';

export interface DefaultClass {
  iri: string;
  label: string;
  icon: string;
}

/**
 * property category can be
 * text, list, data and time, number, link, location and shape
 */
export interface PropertyCategory {
  group: string;
  elements: DefaultProperty[];
}

/**
 * own default property defined for the gui
 * with this information we can build the correct
 * property object to send it to the API
 */
export interface DefaultProperty {
  icon: string;
  label: string;
  description: string;
  subPropOf: string;
  objectType: string;
  guiElement: string;
  group: string;
}

export class DefaultProperties {
  public static unsupported: DefaultProperty = {
    icon: 'warning_amber',
    label: 'Unsupported property type',
    description: 'This property type is not supported in the ontology editor',
    subPropOf: '',
    objectType: '',
    guiElement: '',
    group: 'Warning',
  };

  public static data: PropertyCategory[] = [
    {
      group: 'Text',
      elements: [
        {
          icon: 'short_text',
          label: 'Short',
          description: 'Short text such as title or name',
          subPropOf: Constants.HasValue,
          objectType: Constants.TextValue,
          guiElement: Constants.GuiSimpleText, // better element would be: 'Input',
          group: 'Text', // redundant information, but otherwise we don't get the main group name after selecting type
        },
        {
          icon: 'subject',
          label: 'Paragraph',
          description: 'Long text such as description; could have line breaks',
          subPropOf: Constants.HasValue,
          objectType: Constants.TextValue,
          guiElement: Constants.GuiTextarea,
          group: 'Text',
        },
        {
          icon: 'line_style',
          label: 'Rich Text',
          description: 'A rich text editor with formatting options',
          subPropOf: Constants.HasValue,
          objectType: Constants.TextValue,
          guiElement: Constants.GuiRichText,
          group: 'Text',
        },
      ],
    },
    {
      group: 'List',
      elements: [
        {
          icon: 'arrow_drop_down_circle',
          label: 'Dropdown',
          description: 'Dropdown menu with values from predefined list',
          subPropOf: Constants.HasValue,
          objectType: Constants.ListValue,
          guiElement: Constants.GuiPulldown, // better element would be: 'Pulldown' or 'Select'
          group: 'List',
        },
      ],
    },
    {
      group: 'Boolean',
      elements: [
        {
          icon: 'toggle_off',
          label: 'Yes / No',
          description: 'Yes or no, 1 or 0, true or false',
          subPropOf: Constants.HasValue,
          objectType: Constants.BooleanValue,
          guiElement: Constants.GuiCheckbox, // should be 'Toggle' but it's not supported in DSP-Tangoh,
          group: 'Boolean',
        },
      ],
    },
    {
      group: 'Date / Time',
      elements: [
        {
          icon: 'calendar_today',
          label: 'Date',
          description: 'A date field with day, month and year',
          subPropOf: Constants.HasValue,
          objectType: Constants.DateValue,
          guiElement: Constants.GuiDatePicker,
          group: 'Date / Time',
        },
        {
          icon: 'access_time',
          label: 'Timestamp',
          description: 'A single timestamp (date and time) on a timeline',
          subPropOf: Constants.HasValue,
          objectType: Constants.TimeValue,
          guiElement: Constants.GuiTimeStamp,
          group: 'Date / Time',
        },
        {
          icon: 'timelapse',
          label: 'Time sequence',
          description: 'A time sequence with start and end point on a timeline',
          subPropOf: Constants.HasValue,
          objectType: Constants.IntervalValue,
          guiElement: Constants.GuiInterval,
          group: 'Date / Time',
        },
      ],
    },
    {
      group: 'Number',
      elements: [
        {
          icon: '60fps',
          label: 'Integer',
          description: 'Integer value',
          subPropOf: Constants.HasValue,
          objectType: Constants.IntValue,
          guiElement: Constants.GuiSpinbox, // 'Number',
          group: 'Number',
        },
        {
          icon: 'functions',
          label: 'Decimal',
          description: 'Decimal value',
          subPropOf: Constants.HasValue,
          objectType: Constants.DecimalValue,
          guiElement: Constants.GuiSpinbox, // 'Number',
          group: 'Number',
        },
        {
          icon: 'filter_3',
          label: 'Page number',
          description: 'The page number is needed for page classes in case of part of properties',
          subPropOf: Constants.SeqNum,
          objectType: Constants.IntValue,
          guiElement: Constants.GuiSpinbox, // 'Number',
          group: 'Number',
        },
      ],
    },
    {
      group: 'Link / Relation',
      elements: [
        {
          icon: 'link',
          label: 'Link to class',
          description: 'Refers to a resource class',
          subPropOf: Constants.HasLinkTo,
          objectType: Constants.LinkValue,
          guiElement: Constants.GuiSearchbox, // 'Autocomplete',
          group: 'Link / Relation',
        },
        {
          icon: 'extension',
          label: 'Part of class',
          description: 'Is part of a resource class',
          subPropOf: Constants.IsPartOf,
          objectType: Constants.LinkValue,
          guiElement: Constants.GuiSearchbox, // 'Autocomplete',
          group: 'Link / Relation',
        },
        {
          icon: 'language',
          label: 'External URL',
          description: 'Link to an external website',
          subPropOf: Constants.HasValue,
          objectType: Constants.UriValue,
          guiElement: Constants.GuiSimpleText,
          group: 'Link / Relation',
        },
      ],
    },
    {
      group: 'Location',
      elements: [
        {
          icon: 'place',
          label: 'Place',
          description: 'Geographical location',
          subPropOf: Constants.HasValue,
          objectType: Constants.GeonameValue,
          guiElement: Constants.GuiGeonames,
          group: 'Location',
        },
      ],
    },
    {
      group: 'Shape',
      elements: [
        {
          icon: 'palette',
          label: 'Color',
          description: 'A simple color value',
          subPropOf: Constants.HasValue,
          objectType: Constants.ColorValue,
          guiElement: Constants.GuiColorPicker,
          group: 'Shape',
        },
      ],
    },
  ];
}
